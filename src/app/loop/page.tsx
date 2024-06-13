'use client';

import { useQuery } from '@tanstack/react-query';
import { Col, Form, InputNumber, Row, Select, Table } from 'antd';
import React, { useEffect, useMemo } from 'react';

type Props = {};

const Page = (props: Props) => {
  const [form] = Form.useForm();

  const token = Form.useWatch('token', form);
  const tokensCount = Form.useWatch('tokensCount', form);
  const tokenPrice = Form.useWatch('tokenPrice', form);
  const ltv = Form.useWatch('ltv', form);
  const depositPercent = Form.useWatch('depositPercent', form);
  const borrowPercent = Form.useWatch('borrowPercent', form);

  const {
    isPending: tokensListLoading,
    error: tokensListError,
    data: tokensList,
  } = useQuery({
    queryKey: ['prices'],
    queryFn: () =>
      fetch('https://api.coinpaprika.com/v1/tickers').then((res) => res.json()),
    refetchInterval: 60000,
  });

  const selectedToken = useMemo(
    () => tokensList?.find((t: any) => t?.id === token),
    [token, tokensList]
  );

  useEffect(() => {
    const price = selectedToken?.quotes?.USD?.price;
    if (price) form.setFieldValue('tokenPrice', Number(price.toFixed(5)));
  }, [form, selectedToken?.quotes?.USD?.price]);

  return (
    <Row gutter={24}>
      <Col span={8}>
        <Form
          initialValues={{
            ltv: 0.6,
            depositPercent: 10,
            borrowPercent: -5,
          }}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          layout={'horizontal'}
          form={form}
        >
          <Form.Item label='Токен' name='token'>
            <Select
              showSearch
              placeholder={
                !!tokensListError
                  ? 'Ошибка при запросе к API'
                  : 'Токен'
              }
              filterOption={(input, option) =>
                (`${option?.label}` || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={tokensList?.map((item: any) => ({
                value: item?.id as string,
                label: `${item?.symbol} (${item?.name})` as string,
              }))}
              loading={tokensListLoading}
              disabled={!!tokensListError}
            />
          </Form.Item>
          <Form.Item label='Кол-во токенов' name='tokensCount'>
            <InputNumber
              placeholder='Кол-во токенов'
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label='Цена токена' name='tokenPrice'>
            <InputNumber
              addonAfter='$'
              placeholder='Цена токена'
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label='LTV' name='ltv'>
            <InputNumber placeholder='LTV' style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label='Процент по депозиту' name='depositPercent'>
            <InputNumber
              placeholder='Процент по депозиту'
              style={{ width: '100%' }}
              addonAfter='%'
            />
          </Form.Item>
          <Form.Item label='Процент по займу' name='borrowPercent'>
            <InputNumber
              placeholder='Процент по займу'
              style={{ width: '100%' }}
              addonAfter='%'
            />
          </Form.Item>
        </Form>
      </Col>
      <Col span={16}>
        {!!ltv && !!token && !!tokensCount && (
          <Table
            columns={[
              {
                title: 'Круг',
                dataIndex: 'loop',
                key: 'loop',
              },
              {
                title: `Суммарный депозит ${selectedToken?.symbol}`,
                dataIndex: 'supply',
                key: 'supply',
              },
              {
                title: `Занять ${selectedToken?.symbol}`,
                dataIndex: 'borrow',
                key: 'borrow',
              },
              {
                title: `Суммарный долг ${selectedToken?.symbol}`,
                dataIndex: 'debt',
                key: 'debt',
              },
              {
                title: 'APY (с учетом реинвеста взятого долга)',
                dataIndex: 'apy',
                key: 'apy',
              },
            ]}
            dataSource={[...new Array(20)].reduce((prev, curr, index) => {
              const prevItem = index > 0 ? prev[index - 1] : undefined;
              const supply = Number(
                (
                  (+prevItem?.borrow || 0) +
                    (+prevItem?.supply || +tokensCount) || 0
                )?.toFixed(5)
              );
              const debt = Number((+supply * (+ltv || 0))?.toFixed(5));
              const borrow = Number(
                ((+debt || 0) - (+prevItem?.debt || 0))?.toFixed(5)
              );

              const borrowApy =
                (debt * (borrowPercent / 100)) / (tokensCount / 100);
              const depositApy =
                ((supply + borrow) * (depositPercent / 100)) /
                (tokensCount / 100);

              return [
                ...prev,
                {
                  loop: index + 1,
                  supply,
                  borrow,
                  debt,
                  apy: `${Number((depositApy - borrowApy).toFixed(2))} %`,
                  key: index,
                },
              ];
            }, [])}
            pagination={{ pageSize: 100 }}
          />
        )}
      </Col>
    </Row>
  );
};

export default Page;
