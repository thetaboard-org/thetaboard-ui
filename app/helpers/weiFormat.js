import { helper } from '@ember/component/helper';
import {ethers} from "ethers";

export default helper((args) => {
  const weiValue = String(args[0]) || 0;
  return ethers.utils.formatEther(weiValue);
});
