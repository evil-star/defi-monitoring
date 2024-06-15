'use client';

import useCalculatedLendingData from '@/hooks/useCalculatedLendingData';
import { ILongPosition } from '@/types/positions.interface';
import calcBorrowByHF from '@/utils/calcBorrowByHF';
import calcBorrowByLiquidationPrice from '@/utils/calcBorrowByLiquidationPrice';
import getHfColor from '@/utils/getHfColor';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Timeline,
  Typography,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

type Props = {};

const Page = (props: Props) => {
  const sp = useSearchParams();
  const router = useRouter();
  const positionEditId = sp.get('id');
  const [form] = Form.useForm();
  const [savedPositions, setSavedPositions] = useLocalStorage<ILongPosition[]>(
    'saved-positions',
    []
  );
  const [confirmSaveActive, setConfirmSaveActive] = useState(false);

  const calcType = Form.useWatch('calcType', form);
  const token = Form.useWatch('token', form);
  const tokensCount = Form.useWatch('tokensCount', form);
  const lth = Form.useWatch('lth', form);
  const tokenPrice = Form.useWatch('tokenPrice', form);
  const inputLiquidationPrice = Form.useWatch('liquidationPrice', form);
  const inputHealthFactor = Form.useWatch('hf', form);
  const borrowFactor = Form.useWatch('borrowFactor', form);
  const positionName = Form.useWatch('positionName', form);
  const positionNote = Form.useWatch('positionNote', form);
  const deposit = tokensCount * tokenPrice;

  const {
    isPending: tokensListLoading,
    error: tokensListError,
    data: tokensList,
  } = useQuery({
    queryKey: ['prices'],
    queryFn: () =>
      fetch('https://api.coinpaprika.com/v1/tickers').then((res) => res.json()),
    refetchInterval: 300000,
  });

  const selectedToken = useMemo(
    () => tokensList?.find((t: any) => t?.id === token),
    [token, tokensList]
  );

  const editingPosition = useMemo(
    () => savedPositions.find((p) => p.id === positionEditId),
    [positionEditId, savedPositions]
  );

  if (!editingPosition && !!positionEditId) {
    redirect('/long');
  }

  useEffect(() => {
    const price = selectedToken?.quotes?.USD?.price;
    if (price) form.setFieldValue('tokenPrice', Number(price.toFixed(5)));
  }, [form, selectedToken?.quotes?.USD?.price]);

  const borrowByLiquidationPrice = useMemo(() => {
    if (tokensCount && tokenPrice && inputLiquidationPrice && lth)
      return calcBorrowByLiquidationPrice(
        tokensCount,
        lth,
        tokenPrice,
        inputLiquidationPrice,
        borrowFactor
      );
  }, [tokenPrice, inputLiquidationPrice, lth, tokensCount, borrowFactor]);

  const borrowByHf = useMemo(() => {
    if (deposit && lth && inputHealthFactor)
      return calcBorrowByHF(deposit, lth, inputHealthFactor, borrowFactor);
    else return 0;
  }, [deposit, lth, inputHealthFactor, borrowFactor]);

  const borrow = borrowByLiquidationPrice || borrowByHf;
  const depositWithBorrow = deposit + borrow;

  const { healthFactor, liquidationPrice, riskFactor } =
    useCalculatedLendingData({
      borrow,
      deposit: depositWithBorrow,
      lth,
      tokenPrice,
      borrowFactor,
    });

  const handleSave = useCallback(() => {
    setConfirmSaveActive(true);
  }, []);

  const handleConfirmSave = useCallback(async () => {
    let isFormValid = true;
    try {
      await form.validateFields();
    } catch {
      isFormValid = false;
    }

    if (!isFormValid) return;

    if (editingPosition) {
      setSavedPositions((positions) => [
        ...positions.filter((p) => p.id !== editingPosition.id),
        {
          id: editingPosition.id,
          name: positionName,
          lth,
          tokenId: token,
          tokensCount,
          tokensCountTotal: tokensCount + borrow / tokenPrice,
          type: calcType,
          valueOfType: inputLiquidationPrice || inputHealthFactor,
          borrowFactor,
          positionNote,
          borrowed: borrow,
        },
      ]);
    } else {
      setSavedPositions((positions) => [
        {
          id: uuidv4(),
          name: positionName,
          lth,
          tokenId: token,
          tokensCount,
          tokensCountTotal: tokensCount + borrow / tokenPrice,
          type: calcType,
          valueOfType: inputLiquidationPrice || inputHealthFactor,
          borrowFactor,
          positionNote,
          borrowed: borrow,
        },
        ...positions,
      ]);
    }
    router.push('/saved');
    setConfirmSaveActive(false);
    form.setFieldValue('positionName', '');
  }, [
    editingPosition,
    form,
    setSavedPositions,
    router,
    positionName,
    lth,
    token,
    tokensCount,
    calcType,
    inputLiquidationPrice,
    inputHealthFactor,
    borrowFactor,
    positionNote,
  ]);

  return (
    <>
      <Typography.Title level={2}>
        Лонг {!!positionEditId && '(редактирование позиции)'}
      </Typography.Title>
      <Divider />
      <Row gutter={24}>
        <Modal
          title='Сохранение позиции'
          open={confirmSaveActive}
          onOk={handleConfirmSave}
          onCancel={() => setConfirmSaveActive(false)}
          okText='Сохранить'
          cancelText='Отмена'
        >
          <br />
          <Form
            form={form}
            initialValues={{
              positionName: editingPosition?.name || '',
            }}
          >
            <Form.Item name='positionName' rules={[{ required: true }]}>
              <Input placeholder='Название' style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name='positionNote'>
              <TextArea
                placeholder='Заметка к позиции'
                rows={4}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Form>
        </Modal>
        <Col span={8}>
          <Form
            initialValues={{
              lth: editingPosition?.lth || 0.8,
              borrowFactor: editingPosition?.borrowFactor || 1,
              calcType: editingPosition?.type || 'hf',
              token: editingPosition?.tokenId || '',
              tokensCount: editingPosition?.tokensCount || '',
              tokenPrice: selectedToken?.quotes?.USD?.price,
              hf:
                editingPosition?.type === 'hf'
                  ? editingPosition?.valueOfType
                  : '',
              liquidationPrice:
                editingPosition?.type === 'liqPrice'
                  ? editingPosition?.valueOfType
                  : '',
            }}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            layout={'horizontal'}
            form={form}
          >
            <Form.Item label='Вычисление на основе' name='calcType'>
              <Select
                placeholder='Вычисление на основе'
                options={[
                  { value: 'hf', label: 'Health Factor' },
                  { value: 'liqPrice', label: 'Цены ликвидации' },
                ]}
              />
            </Form.Item>
            <Form.Item label='Токен для лонга' name='token'>
              <Select
                showSearch
                placeholder={
                  !!tokensListError
                    ? 'Ошибка при запросе к API'
                    : 'Токен для лонга'
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
            {calcType === 'liqPrice' && (
              <Form.Item label='Цена ликвидации' name='liquidationPrice'>
                <InputNumber
                  addonAfter='$'
                  placeholder='Цена ликвидации'
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
            {calcType === 'hf' && (
              <Form.Item label='Health factor' name='hf'>
                <InputNumber
                  placeholder='Health factor'
                  style={{ width: '100%' }}
                />
              </Form.Item>
            )}
            <Form.Item label='Токенов в депозите' name='tokensCount'>
              <InputNumber
                placeholder='Кол-во токенов в депозите'
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
            <Form.Item label='LTH' name='lth'>
              <InputNumber placeholder='LTH' style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item label='Borrow Factor' name='borrowFactor'>
              <InputNumber
                placeholder='Borrow factor'
                style={{ width: '100%' }}
              />
            </Form.Item>
            <Flex justify='end'>
              <Button
                type='primary'
                disabled={
                  !tokenPrice ||
                  !(inputHealthFactor || inputLiquidationPrice) ||
                  !token ||
                  !lth ||
                  !tokensCount
                }
                onClick={handleSave}
              >
                {positionEditId ? 'Сохранить изменения' : 'Сохранить'}
              </Button>
            </Flex>
          </Form>
        </Col>
        <Col span={16}>
          {!!deposit &&
          !!borrow &&
          !!depositWithBorrow &&
          !!liquidationPrice &&
          !!healthFactor &&
          !!riskFactor ? (
            <>
              <Timeline>
                {!!deposit && (
                  <Timeline.Item>
                    Начальный депозит <b>{Number(deposit.toFixed(3))} $</b>
                  </Timeline.Item>
                )}
                {!!borrow && (
                  <Timeline.Item>
                    Берем стейблкойн в долг, покупаем токен и кладем на сторону
                    депозита, пока долг не составит{' '}
                    <b>{Number(borrow.toFixed(4))} $</b>
                  </Timeline.Item>
                )}
                {!!depositWithBorrow && (
                  <Timeline.Item>
                    Итоговая сумма депозита{' '}
                    <b>{Number(depositWithBorrow.toFixed(3))} $</b>
                  </Timeline.Item>
                )}
                {!!borrow && <Timeline.Item>PROFIT</Timeline.Item>}
              </Timeline>
              <Space wrap>
                {!!liquidationPrice && (
                  <Card>
                    <Statistic
                      title='Ликвидация при цене токена'
                      value={`${Number(liquidationPrice.toFixed(4))}`}
                      suffix='$'
                    />
                  </Card>
                )}
                {!!healthFactor && (
                  <Card>
                    <Statistic
                      title='Health Factor'
                      value={Number(healthFactor.toFixed(3))}
                      valueStyle={{
                        color: getHfColor(Number(healthFactor.toFixed(3))),
                      }}
                    />
                  </Card>
                )}
                {!!riskFactor && (
                  <Card>
                    <Statistic
                      title='Risk Factor'
                      value={Number(riskFactor.toFixed(3))}
                      suffix='%'
                    />
                  </Card>
                )}
              </Space>
              <br />
              <br />
              {!!depositWithBorrow && (
                <Table
                  columns={[
                    {
                      title: 'Рост цены токена',
                      dataIndex: 'priceChange',
                      key: 'priceChange',
                    },
                    {
                      title: 'Прибыль депозита с лонгом',
                      dataIndex: 'income',
                      key: 'income',
                    },
                    {
                      title: 'Прибыль депозита без лонга',
                      dataIndex: 'income2',
                      key: 'income2',
                    },
                  ]}
                  dataSource={[20, 50, 100, 150, 200, 300].map(
                    (percent, index) => ({
                      key: index + 1,
                      priceChange: `+${percent}%`,
                      income: `+${Math.round(
                        depositWithBorrow * (percent / 100)
                      )} $`,
                      income2: `+${Math.round(deposit * (percent / 100))} $`,
                    })
                  )}
                />
              )}
            </>
          ) : (
            <Empty
              description={<>Заполните форму</>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            ></Empty>
          )}
        </Col>
      </Row>
    </>
  );
};

export default Page;
