'use client';

import { ILongPosition } from '@/types/positions.interface';
import formatSavedPositions from '@/utils/formatSavedPositions';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Row,
  Spin,
  Statistic,
  Tabs,
  Typography,
} from 'antd';
import React, { useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { gold, green, red } from '@ant-design/colors';
import { useRouter } from 'next/navigation';

type Props = {};

const Page = (props: Props) => {
  const router = useRouter();
  const {
    isLoading: tokensListLoading,
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
      <Divider />
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
                    <Row gutter={16}>
                      {savedPositionsModified.map((position, index) => (
                        <Col key={index} span={6}>
                          <Card
                            title={
                              <Flex align='center'>
                                {position.name}{' '}
                                <Flex style={{ marginLeft: 'auto' }} gap={12}>
                                  <Button
                                    type='primary'
                                    ghost
                                    onClick={() =>
                                      router.push(`/long?id=${position.id}`)
                                    }
                                  >
                                    Редактировать
                                  </Button>
                                  <Button
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
                              </Flex>
                            }
                          >
                            <Flex
                              style={{ width: '100%' }}
                              justify='space-between'
                              wrap
                            >
                              <Statistic
                                title='Health factor'
                                value={Number(position.healthFactor.toFixed(2))}
                                valueStyle={{
                                  color:
                                    position.healthFactor < 1.3
                                      ? red[4]
                                      : position.healthFactor < 1.55
                                      ? gold[5]
                                      : green[5],
                                }}
                              />
                              <Statistic
                                title='Risk factor'
                                value={`${Number(
                                  position.riskFactor.toFixed(2)
                                )} %`}
                              />
                              <Statistic
                                title='Цена ликвидации'
                                value={`${Number(
                                  position.liquidationPrice.toFixed(1)
                                )} $`}
                              />
                            </Flex>
                            <Divider />
                            <Row gutter={[16, 24]}>
                              <Col span={12}>
                                <Statistic
                                  valueStyle={{ fontSize: 16 }}
                                  title='Депозит'
                                  value={`${Number(
                                    position.deposit.toFixed(1)
                                  )} $ (${Number(
                                    (
                                      position.deposit / position.tokenPrice
                                    ).toFixed(5)
                                  )}
                                ${position.tokenSymbol})`}
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  valueStyle={{ fontSize: 16 }}
                                  title='Долг'
                                  value={`${Number(
                                    position.borrowed.toFixed(2)
                                  )} $`}
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  valueStyle={{ fontSize: 16 }}
                                  title='LTH'
                                  value={`${position.lth}`}
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  valueStyle={{ fontSize: 16 }}
                                  title='Borrow factor'
                                  value={`${position.borrowFactor}`}
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  valueStyle={{ fontSize: 16 }}
                                  title='Текущая цена токена'
                                  value={`${Number(
                                    position?.tokenPrice?.toFixed(5)
                                  )} $`}
                                />
                              </Col>
                            </Row>
                            {/*

                            <Card.Grid style={gridStyle}>
                              Депозит: {Number(position.deposit.toFixed(1))} $ (
                              {Number(
                                (
                                  position.deposit / position.tokenPrice
                                ).toFixed(5)
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
                            </Card.Grid> */}
                          </Card>
                        </Col>
                      ))}
                    </Row>
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
