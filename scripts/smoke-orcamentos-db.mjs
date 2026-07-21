import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const count = await prisma.orcamento.count();
  console.log('DB_OK count=' + count);

  const created = await prisma.orcamento.create({
    data: {
      profissionalNome: 'Teste Auto',
      profissionalWhatsapp: '5562999990000',
      clienteNome: 'Cliente Teste',
      clienteContato: 'cliente@teste.com',
      itens: [{ id: '1', nome: 'Servico teste', quantidade: 2, valorUnitario: 150 }],
      total: 300,
      validade: '7 dias',
      observacoes: 'Smoke test automatizado',
      ownerEmail: 'teste@resolvajato.local'
    }
  });
  console.log('CREATE_OK id=' + created.id);

  const fetched = await prisma.orcamento.findUnique({ where: { id: created.id } });
  console.log('READ_OK status=' + fetched.status + ' total=' + fetched.total);

  const updated = await prisma.orcamento.update({
    where: { id: created.id },
    data: { status: 'approved' }
  });
  console.log('UPDATE_OK status=' + updated.status);

  await prisma.orcamento.delete({ where: { id: created.id } });
  console.log('DELETE_OK cleanup');
} catch (error) {
  console.error('FAIL', error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
