import { gold, green, red } from '@ant-design/colors';

const getHfColor = (hf: number) => {
  return hf < 1.3 ? red[4] : hf < 1.55 ? gold[5] : green[5];
};

export default getHfColor;
