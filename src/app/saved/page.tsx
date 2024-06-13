'use client';

import { ILongPosition } from '@/types/positions.interface';
import calcBorrowByHF from '@/utils/calcBorrowByHF';
import calcBorrowByLiquidationPrice from '@/utils/calcBorrowByLiquidationPrice';
import formatSavedPositions from '@/utils/formatSavedPositions';
import getHf from '@/utils/getHf';
import getLiquidationPrice from '@/utils/getLiquidationPrice';
import getRiskFactor from '@/utils/getRiskFactor';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Empty, Flex, Space, Spin, Tabs, Typography } from 'antd';
import React, { useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';

type Props = {};

const gridStyle: React.CSSProperties = {
  width: '25%',
  textAlign: 'center',
};

const Page = (props: Props) => {
  const {
    isLoading: tokensListLoading,
    error: tokensListError,
    data: tokensList,
  } = useQuery({
    queryKey: ['prices'],
    queryFn: () =>
      fetch('https://api.coinpaprika.com/v1/tickers').then((res) => res.json()),
    refetchInterval: 300000,
  });

  const [savedPositions, setSavedPositions] = useLocalStorage<ILongPosition[]>(
    'saved-positions',
    []
  );

  const savedPositionsModified = useMemo(
    () =>
      !!tokensList?.length
        ? formatSavedPositions(savedPositions, tokensList)
        : [],
    [savedPositions, tokensList]
  );

  return (
    <div>
      <Typography.Title level={2}>Сохраненное</Typography.Title>
      <Tabs
        defaultActiveKey='1'
        items={[
          {
            key: '1',
            label: 'Лонги',
            children: (
              <>
                {tokensListLoading ? (
                  <Flex justify='center' style={{ padding: 80 }}>
                    <Spin tip='Загрузка' size='large'></Spin>
                  </Flex>
                ) : !savedPositions?.length ? (
                  <Empty description='Нет сохраненных позиций' />
                ) : (
                  <>
                    <Space direction='vertical' style={{ width: '100%' }}>
                      {savedPositionsModified.map((position, index) => (
                        <Card
                          key={index}
                          title={
                            <Flex justify='space-between'>
                              {position.name}{' '}
                              <Button
                                type='primary'
                                danger
                                onClick={() =>
                                  setSavedPositions((positions) =>
                                    positions.filter(
                                      (p) => p.name !== position.name
                                    )
                                  )
                                }
                              >
                                Удалить
                              </Button>
                            </Flex>
                          }
                        >
                          <Card.Grid style={{ ...gridStyle, width: '33.33%' }}>
                            <Flex align='end' justify='center' gap={10}>
                              Health factor:{' '}
                              <Typography.Title
                                level={4}
                                style={{ margin: 0 }}
                                type={
                                  position.healthFactor < 1.3
                                    ? 'danger'
                                    : position.healthFactor < 1.55
                                    ? 'warning'
                                    : 'success'
                                }
                              >
                                {Number(position.healthFactor.toFixed(2))}
                              </Typography.Title>
                            </Flex>
                          </Card.Grid>
                          <Card.Grid style={{ ...gridStyle, width: '33.33%' }}>
                            <Flex align='end' justify='center' gap={10}>
                              Risk factor:
                              <Typography.Title level={4} style={{ margin: 0 }}>
                                {Number(position.riskFactor.toFixed(2))} %
                              </Typography.Title>
                            </Flex>
                          </Card.Grid>
                          <Card.Grid style={{ ...gridStyle, width: '33.33%' }}>
                            <Flex align='end' justify='center' gap={10}>
                              Цена ликвидации:{' '}
                              <Typography.Title level={4} style={{ margin: 0 }}>
                                {Number(position.liquidationPrice.toFixed(1))} $
                              </Typography.Title>
                            </Flex>
                          </Card.Grid>
                          <Card.Grid style={gridStyle}>
                            Депозит: {Number(position.deposit.toFixed(1))} $ (
                            {Number(
                              (position.deposit / position.tokenPrice).toFixed(
                                5
                              )
                            )}{' '}
                            {position.tokenSymbol})
                          </Card.Grid>
                          <Card.Grid style={gridStyle}>
                            Долг: {Number(position.borrowed.toFixed(2))} $
                          </Card.Grid>
                          <Card.Grid style={gridStyle}>
                            LTH: {position.lth}
                          </Card.Grid>
                          <Card.Grid style={gridStyle}>
                            Borrow factor: {position.borrowFactor}
                          </Card.Grid>
                        </Card>
                      ))}
                    </Space>
                  </>
                )}
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Page;
