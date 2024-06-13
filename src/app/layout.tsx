'use client';

import React from 'react';
import { Badge, Flex, Layout, Menu, Typography } from 'antd';
import '@/assets/styles/global.sass';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Link from 'next/link';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useLocalStorage } from 'usehooks-ts';
import { ILongPosition } from '@/types/positions.interface';

const { Header, Content } = Layout;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [savedPositions] = useLocalStorage<ILongPosition[]>(
    'saved-positions',
    []
  );

  return (
    <html lang='ru'>
      <body>
        <AntdRegistry>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
          >
            <Layout>
              <Header
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
                }}
              >
                <Link href='/'>
                  <Typography.Title
                    color='#fff'
                    level={1}
                    style={{ margin: '0 15px 0 0', color: '#fff' }}
                  >
                    DeFi
                  </Typography.Title>
                </Link>
                <Menu
                  theme='dark'
                  mode='horizontal'
                  items={[
                    { key: 1, label: <Link href='/long'>Лонг стратегии</Link> },
                    // {
                    //   key: 2,
                    //   label: <Link href='/short'>Шорт стратегии</Link>,
                    // },
                    {
                      key: 3,
                      label: <Link href='/loop'>Лупинг</Link>,
                    },
                    {
                      key: 4,
                      label: <Link href='/lending'>Кредитование</Link>,
                    },
                    {
                      key: 5,
                      label: (
                        <Link href='/saved'>
                          <Flex align='center' gap={'10px'}>
                            Сохраненное
                            <Badge
                              count={savedPositions?.length}
                              size='small'
                            />
                          </Flex>
                        </Link>
                      ),
                    },
                  ]}
                  style={{ flex: 1, minWidth: 0 }}
                />
              </Header>
              <Content style={{ padding: '16px' }}>
                <div
                  style={{
                    background: '#fff',
                    minHeight: 280,
                    padding: 16,
                    borderRadius: 8,
                  }}
                >
                  {children}
                </div>
              </Content>
            </Layout>
          </PersistQueryClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
};

export default RootLayout;
