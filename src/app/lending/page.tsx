'use client';

import { ILendingPosition } from '@/types/positions.interface';
import getHf from '@/utils/getHf';
import getHfColor from '@/utils/getHfColor';
import getLiquidationPrice from '@/utils/getLiquidationPrice';
import getRiskFactor from '@/utils/getRiskFactor';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Typography,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { use, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

type Props = {};

const Page = (props: Props) => {
  const sp = useSearchParams();
  const router = useRouter();
  const positionEditId = sp.get('id');
  const [form] = Form.useForm();
  const [savedLendingPositions, setSavedLendingPositions] = useLocalStorage<
    ILendingPosition[]
  >('saved-lending-positions', []);
  const [confirmSaveActive, setConfirmSaveActive] = useState(false);

  const depositToken = Form.useWatch('depositToken', form);
  const depositTokensCount = Form.useWatch('depositTokensCount', form);
  const depositTokensPrice = Form.useWatch('depositTokensPrice', form);
  const borrowToken = Form.useWatch('borrowToken', form);
  const borrowTokensCount = Form.useWatch('borrowTokensCount', form);
  const borrowTokensPrice = Form.useWatch('borrowTokensPrice', form);
  const borrowFactor = Form.useWatch('borrowFactor', form);
  const lth = Form.useWatch('lth', form);
  const positionNote = Form.useWatch('positionNote', form);

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

  const editingPosition = useMemo(
    () => savedLendingPositions.find((p) => p.id === positionEditId),
    [positionEditId, savedLendingPositions]
  );

  const selectedDepositToken = useMemo(
    () => tokensList?.find((t: any) => t?.id === depositToken),
    [depositToken, tokensList]
  );
  const selectedBorrowToken = useMemo(
    () => tokensList?.find((t: any) => t?.id === borrowToken),
    [borrowToken, tokensList]
  );

  useEffect(() => {
    const priceDeposit = selectedDepositToken?.quotes?.USD?.price;
    const priceBorrow = selectedBorrowToken?.quotes?.USD?.price;
    if (priceDeposit)
      form.setFieldValue('depositTokensPrice', Number(priceDeposit.toFixed(5)));
    if (priceBorrow)
      form.setFieldValue('borrowTokensPrice', Number(priceBorrow.toFixed(5)));
  }, [
    form,
    selectedDepositToken?.quotes?.USD?.price,
    selectedBorrowToken?.quotes?.USD?.price,
  ]);

  const isFilled =
    !!depositToken &&
    !!depositTokensPrice &&
    !!depositTokensCount &&
    !!borrowToken &&
    !!borrowTokensPrice &&
    !!borrowTokensCount;

  const handleConfirmSave = useCallback(async () => {
    let isFormValid = true;
    try {
      await form.validateFields();
    } catch {
      isFormValid = false;
    }

    if (!isFormValid) return;

    if (editingPosition) {
      setSavedLendingPositions((positions) => [
        ...positions.filter((p) => p.id !== editingPosition.id),
        {
          id: editingPosition.id,
          depositToken,
          depositTokensCount,
          borrowToken,
          borrowTokensCount,
          lth,
          borrowFactor,
          note: positionNote,
        },
      ]);
    } else {
      setSavedLendingPositions((positions) => [
        {
          id: uuidv4(),
          depositToken,
          depositTokensCount,
          borrowToken,
          borrowTokensCount,
          lth,
          borrowFactor,
          note: positionNote,
        },
        ...positions,
      ]);
    }
    router.push('/saved?type=2');
    setConfirmSaveActive(false);
    form.setFieldValue('positionNote', '');
  }, [
    editingPosition,
    form,
    setSavedLendingPositions,
    router,
    depositToken,
    depositTokensCount,
    borrowToken,
    borrowTokensCount,
    lth,
    borrowFactor,
    positionNote,
  ]);

  const handleSave = useCallback(() => {
    setConfirmSaveActive(true);
  }, []);

  return (
    <>
      <Typography.Title level={2}>Кредитование</Typography.Title>
      <Divider />
      <Row gutter={24}>
        <Col span={24}>
          <Form
            initialValues={{
              depositToken: editingPosition?.depositToken,
              depositTokensCount: editingPosition?.depositTokensCount,
              borrowToken: editingPosition?.borrowToken,
              borrowTokensCount: editingPosition?.borrowTokensCount,
              lth: editingPosition?.lth || 0.8,
              borrowFactor: editingPosition?.borrowFactor || 1,
            }}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            layout={'horizontal'}
            form={form}
          >
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Divider>Депозит</Divider>
                <Form.Item label='Токен депозита' name='depositToken'>
                  <Select
                    showSearch
                    placeholder={
                      !!tokensListError ? 'Ошибка при запросе к API' : 'Токен'
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
                <Form.Item
                  label='Кол-во токенов в депозите'
                  name='depositTokensCount'
                >
                  <InputNumber
                    placeholder='Кол-во токенов'
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  label='Цена токена депозита'
                  name='depositTokensPrice'
                >
                  <InputNumber
                    addonAfter='$'
                    placeholder='Цена токена'
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label='LTH' name='lth'>
                  <InputNumber placeholder='LTH' style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Divider>Займ</Divider>
                <Form.Item label='Токен депозита' name='borrowToken'>
                  <Select
                    showSearch
                    placeholder={
                      !!tokensListError ? 'Ошибка при запросе к API' : 'Токен'
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
                <Form.Item
                  label='Кол-во токенов в депозите'
                  name='borrowTokensCount'
                >
                  <InputNumber
                    placeholder='Кол-во токенов'
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item
                  label='Цена токена депозита'
                  name='borrowTokensPrice'
                >
                  <InputNumber
                    addonAfter='$'
                    placeholder='Цена токена'
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label='Borrow factor' name='borrowFactor'>
                  <InputNumber
                    placeholder='Borrow factor'
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Flex justify='end'>
                  <Button
                    type='primary'
                    disabled={!isFilled}
                    onClick={handleSave}
                  >
                    {positionEditId
                      ? 'Сохранить изменения'
                      : 'Сохранить позицию'}
                  </Button>
                </Flex>
              </Col>
            </Row>
          </Form>
        </Col>
        <Col span={24}>
          <br />
          {isFilled ? (
            <Flex justify='center' gap={16} wrap>
              <Card>
                <Statistic
                  title='Health Factor'
                  value={`${Number(
                    getHf(
                      depositTokensCount * depositTokensPrice,
                      borrowTokensCount * borrowTokensPrice,
                      lth,
                      borrowFactor
                    ).toFixed(1)
                  )}`}
                  valueStyle={{
                    color: getHfColor(
                      getHf(
                        depositTokensCount * depositTokensPrice,
                        borrowTokensCount * borrowTokensPrice,
                        lth,
                        borrowFactor
                      )
                    ),
                  }}
                />
              </Card>
              <Card>
                <Statistic
                  title={`Risk factor`}
                  value={`${Number(
                    getRiskFactor(
                      borrowTokensCount * borrowTokensPrice,
                      depositTokensCount * depositTokensPrice,
                      lth
                    ).toFixed(1)
                  )} %`}
                />
              </Card>
              <Card>
                <Statistic
                  title='Цена ликвидации токена депозита'
                  value={`${Number(
                    getLiquidationPrice(
                      borrowTokensCount * borrowTokensPrice,
                      depositTokensCount * depositTokensPrice,
                      depositTokensPrice,
                      lth
                    ).toFixed(4)
                  )} $`}
                />
              </Card>
              <Card>
                <Statistic
                  title='Цена ликвидации токена займа'
                  value={`${Number(
                    (
                      (depositTokensCount * depositTokensPrice * lth) /
                      borrowTokensCount
                    ).toFixed(4)
                  )} $`}
                />
              </Card>
            </Flex>
          ) : (
            <Empty
              description={<>Заполните форму</>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            ></Empty>
          )}
        </Col>
      </Row>

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
            positionNote: editingPosition?.note || '',
          }}
        >
          <Form.Item name='positionNote'>
            <TextArea
              placeholder='Заметка к позиции'
              rows={4}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Page;
