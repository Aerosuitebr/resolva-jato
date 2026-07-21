import { buildPixBrCode, crc16Ccitt } from '../src/lib/pix/brcode.ts';
const code = buildPixBrCode({ key: '12345678909', keyType: 'cpf', merchantName: 'Teste', merchantCity: 'Goiania', amount: 10.5, description: 'Pedido1' });
console.log('PIX_OK len=' + code.length + ' ends=' + code.slice(-4) + ' hasBR=' + code.includes('BR') + ' crcSelf=' + (code.slice(-4) === crc16Ccitt(code.slice(0, -4))));
