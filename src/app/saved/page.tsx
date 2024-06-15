'use client';

import { ILendingPosition, ILongPosition } from '@/types/positions.interface';
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
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Typography,
} from 'antd';
import React, { useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { gold, green, red } from '@ant-design/colors';
import { useRouter, useSearchParams } from 'next/navigation';
import formatSavedLendingPositions from '@/utils/formatSavedLendingPositions';
import getHfColor from '@/utils/getHfColor';

type Props = {};

const Page = (props: Props) => {
  const router = useRouter();
  const sp = useSearchParams();
  const type = sp.get('type');
  const [savedPositions, setSavedPositions] = useLocalStorage<ILongPosition[]>(
    'saved-positions',
    []
  );
  const [savedLendingPositions, setSavedLendingPositions] = useLocalStorage<
    ILendingPosition[]
  >('saved-lending-positions', []);

  const { isLoading: tokensListLoading, data: tokensList } = useQuery({
    queryKey: ['prices'],
    queryFn: () =>
      fetch('https://api.coinpaprika.com/v1/tickers').then((res) => res.json()),
    refetchInterval: 300000,
    enabled: !!savedPositions?.length,
  });

  const savedPositionsModified = useMemo(
    () =>
      !!tokensList?.length
        ? formatSavedPositions(savedPositions, tokensList)
        : [],
    [savedPositions, tokensList]
  );
  const savedLendingPositionsModified = useMemo(
    () =>
      !!tokensList?.length
        ? formatSavedLendingPositions(savedLendingPositions, tokensList)
        : [],
    [savedLendingPositions, tokensList]
  );

  return (
    <div>
      <Typography.Title level={2}>Сохраненное</Typography.Title>
      <Divider />
      <Tabs
        defaultActiveKey={type || '1'}
        items={[
          {
            key: '1',
            label: 'Лонги',
            children: (
              <>
                <Space>
                  <Card>
                    <Statistic
                      title='Суммарный депозит'
                      value={`${Number(
                        savedPositionsModified
                          .reduce(
                            (prev, cur) =>
                              prev + cur.tokensCountTotal * cur.tokenPrice,
                            0
                          )
                          .toFixed(1)
                      )} $`}
                    />
                  </Card>
                  <Card>
                    <Statistic
                      title='Суммарный долг'
                      value={`${Number(
                        savedPositionsModified
                          .reduce((prev, cur) => prev + (cur.borrowed || 0), 0)
                          .toFixed(1)
                      )} $`}
                    />
                  </Card>
                </Space>
                <br />
                <br />
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
                        <Col key={index} span={8}>
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
                                          (p) => p.id !== position.id
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
                                  position.liquidationPrice.toFixed(3)
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
                                    (
                                      position.tokensCount *
                                        position.tokenPrice +
                                      (position.borrowed || 0)
                                    ).toFixed(1)
                                  )} $ (${Number(
                                    position?.tokensCountTotal?.toFixed(5)
                                  )}
                                ${position.tokenSymbol})`}
                                />
                              </Col>
                              <Col span={12}>
                                <Statistic
                                  valueStyle={{ fontSize: 16 }}
                                  title='Долг'
                                  value={`${Number(
                                    position?.borrowed?.toFixed(2)
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
                            {!!position.positionNote && (
                              <>
                                <Divider />
                                <Typography>{position.positionNote}</Typography>
                              </>
                            )}
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}
              </>
            ),
          },
          {
            key: '2',
            label: 'Кредитование',
            children: (
              <>
                <Space>
                  <Card>
                    <Statistic
                      title='Суммарный депозит'
                      value={`${Number(
                        savedLendingPositionsModified
                          .reduce(
                            (prev, cur) =>
                              prev +
                              (cur.depositTokensCount *
                                cur.depositTokensPrice || 0),
                            0
                          )
                          .toFixed(1)
                      )} $`}
                    />
                  </Card>
                  <Card>
                    <Statistic
                      title='Суммарный долг'
                      value={`${Number(
                        savedLendingPositionsModified
                          .reduce(
                            (prev, cur) =>
                              prev +
                              (cur.borrowTokensCount * cur.borrowTokensPrice ||
                                0),
                            0
                          )
                          .toFixed(1)
                      )} $`}
                    />
                  </Card>
                </Space>
                <br />
                <br />
                {tokensListLoading ? (
                  <Flex justify='center' style={{ padding: 80 }}>
                    <Spin tip='Загрузка' size='large'></Spin>
                  </Flex>
                ) : (
                  <>
                    <Table
                      dataSource={savedLendingPositionsModified.map(
                        (position, index) => ({
                          key: index,
                          deposit: `${position.depositTokensCount} ${
                            position.depositTokenSymbol
                          } (${Number(
                            (
                              position.depositTokensCount *
                              position.depositTokensPrice
                            ).toFixed(1)
                          )} $)`,
                          depositTokensPrice: `${Number(
                            position.depositTokensPrice.toFixed(4)
                          )} $`,
                          borrow: `${position.borrowTokensCount} ${
                            position.borrowTokenSymbol
                          } (${Number(
                            (
                              position.borrowTokensCount *
                              position.borrowTokensPrice
                            ).toFixed(1)
                          )} $)`,
                          borrowTokensPrice: `${Number(
                            position.borrowTokensPrice.toFixed(4)
                          )} $`,
                          hf: (
                            <span
                              style={{
                                color: getHfColor(position.healthFactor),
                              }}
                            >
                              {position.healthFactor}
                            </span>
                          ),
                          rf: position.riskFactor,
                          liqPrice: (
                            <>
                              {position.depositTokenSymbol} -{' '}
                              {position.depositTokenLiqPrice}
                              <br />
                              {position.borrowTokenSymbol} -{' '}
                              {position.borrowTokenLiqPrice}
                            </>
                          ),
                          note: position.note,
                          actions: (
                            <Space size={'small'}>
                              <Button
                                type='primary'
                                ghost
                                onClick={() =>
                                  router.push(`/lending?id=${position.id}`)
                                }
                                size='small'
                              >
                                Редактировать
                              </Button>
                              <Button
                                danger
                                onClick={() =>
                                  setSavedLendingPositions((positions) =>
                                    positions.filter(
                                      (p) => p.id !== position.id
                                    )
                                  )
                                }
                                size='small'
                              >
                                Удалить
                              </Button>
                            </Space>
                          ),
                        })
                      )}
                      columns={[
                        {
                          title: 'Депозит',
                          dataIndex: 'deposit',
                          key: 'deposit',
                        },
                        {
                          title: 'Цена токена',
                          dataIndex: 'depositTokensPrice',
                          key: 'depositTokensPrice',
                        },
                        {
                          title: 'Займ',
                          dataIndex: 'borrow',
                          key: 'borrow',
                        },
                        {
                          title: 'Цена токена',
                          dataIndex: 'borrowTokensPrice',
                          key: 'borrowTokensPrice',
                        },
                        {
                          title: 'HF',
                          dataIndex: 'hf',
                          key: 'hf',
                        },
                        {
                          title: 'Risk factor',
                          dataIndex: 'rf',
                          key: 'rf',
                        },
                        {
                          title: 'Цена ликвидации',
                          dataIndex: 'liqPrice',
                          key: 'liqPrice',
                        },
                        {
                          title: 'Заметка',
                          dataIndex: 'note',
                          key: 'note',
                        },
                        {
                          title: 'Действия',
                          dataIndex: 'actions',
                          key: 'actions',
                        },
                      ]}
                    />
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
