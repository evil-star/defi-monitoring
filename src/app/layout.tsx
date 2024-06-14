'use client';

import React, { useEffect, useState } from 'react';
import { Badge, Flex, Layout, Menu, Typography } from 'antd';
import '@/assets/styles/global.sass';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import Link from 'next/link';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { useLocalStorage } from 'usehooks-ts';
import { ILongPosition } from '@/types/positions.interface';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();
  const [current, setCurrent] = useState(pathname);
  const [savedPositions] = useLocalStorage<ILongPosition[]>(
    'saved-positions',
    []
  );

  useEffect(() => {
    if (current !== pathname) setCurrent(pathname);
  }, [pathname, current]);

  const handleClick = (e: any) => {
    setCurrent(e.key);
  };

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
                  onClick={handleClick}
                  selectedKeys={[current]}
                  items={[
                    {
                      key: '/long',
                      label: <Link href='/long'>Расчет лонга</Link>,
                    },
                    // {
                    //   key: 2,
                    //   label: <Link href='/short'>Шорт стратегии</Link>,
                    // },
                    {
                      key: '/loop',
                      label: <Link href='/loop'>Лупинг</Link>,
                    },
                    {
                      key: '/lending',
                      label: <Link href='/lending'>Кредитование</Link>,
                    },
                    {
                      key: '/saved',
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
