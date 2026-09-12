import { PrismaClient, WorkOrderStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Pequeno gerador pseudoaleatório determinístico (dados de demonstração reproduzíveis)
function createRng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}
const rng = createRng(42);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}
function pickMany<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}
function randomInt(min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}
function daysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}
function daysFromNow(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log('Iniciando seed do AutoControl...');

  // ---------- USUÁRIOS ----------
  const passwordHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@autocontrol.com.br' },
    update: {},
    create: {
      name: 'Ana Paula Ferreira',
      email: 'admin@autocontrol.com.br',
      passwordHash,
      role: 'ADMIN',
    },
  });

  const users = [admin];
  console.log('Usuários criados.');

  // ---------- CLIENTES ----------
  const clientsData = [
    { name: 'João da Silva', cpf: '11111111101', phone: '(11) 98111-1101', city: 'São Paulo', state: 'SP' },
    { name: 'Maria Oliveira Santos', cpf: '11111111102', phone: '(11) 98111-1102', city: 'São Paulo', state: 'SP' },
    { name: 'Pedro Henrique Costa', cpf: '11111111103', phone: '(11) 98111-1103', city: 'Guarulhos', state: 'SP' },
    { name: 'Ana Beatriz Almeida', cpf: '11111111104', phone: '(11) 98111-1104', city: 'Osasco', state: 'SP' },
    { name: 'Lucas Gabriel Pereira', cpf: '11111111105', phone: '(11) 98111-1105', city: 'São Paulo', state: 'SP' },
    { name: 'Juliana Rodrigues', cpf: '11111111106', phone: '(11) 98111-1106', city: 'Santo André', state: 'SP' },
    { name: 'Fernando Souza Lima', cpf: '11111111107', phone: '(11) 98111-1107', city: 'São Paulo', state: 'SP' },
    { name: 'Camila Ferreira Dias', cpf: '11111111108', phone: '(11) 98111-1108', city: 'Diadema', state: 'SP' },
    { name: 'Rafael Martins Barbosa', cpf: '11111111109', phone: '(11) 98111-1109', city: 'São Paulo', state: 'SP' },
    { name: 'Patrícia Gomes Ribeiro', cpf: '11111111110', phone: '(11) 98111-1110', city: 'Mauá', state: 'SP' },
  ];

  const clients = [];
  for (const c of clientsData) {
    const client = await prisma.client.upsert({
      where: { cpf: c.cpf },
      update: {},
      create: {
        name: c.name,
        cpf: c.cpf,
        phone: c.phone,
        whatsapp: c.phone,
        email: `${c.name.split(' ')[0].toLowerCase()}@exemplo.com.br`,
        zipCode: '01310-100',
        street: 'Avenida Paulista',
        number: String(randomInt(100, 2000)),
        district: 'Bela Vista',
        city: c.city,
        state: c.state,
      },
    });
    clients.push(client);
  }
  console.log('Clientes criados.');

  // ---------- VEÍCULOS ----------
  const vehiclesData = [
    { brand: 'Chevrolet', model: 'Onix', plate: 'ABC1A11', year: 2021, color: 'Branco' },
    { brand: 'Toyota', model: 'Corolla', plate: 'ABC1A12', year: 2020, color: 'Prata' },
    { brand: 'Fiat', model: 'Argo', plate: 'ABC1A13', year: 2022, color: 'Vermelho' },
    { brand: 'Volkswagen', model: 'Gol', plate: 'ABC1A14', year: 2019, color: 'Preto' },
    { brand: 'Honda', model: 'Civic', plate: 'ABC1A15', year: 2021, color: 'Cinza' },
    { brand: 'Hyundai', model: 'HB20', plate: 'ABC1A16', year: 2020, color: 'Branco' },
    { brand: 'Renault', model: 'Kwid', plate: 'ABC1A17', year: 2022, color: 'Laranja' },
    { brand: 'Jeep', model: 'Renegade', plate: 'ABC1A18', year: 2021, color: 'Verde' },
    { brand: 'Ford', model: 'Ka', plate: 'ABC1A19', year: 2018, color: 'Prata' },
    { brand: 'Nissan', model: 'Kicks', plate: 'ABC1A20', year: 2022, color: 'Branco' },
    { brand: 'Chevrolet', model: 'Tracker', plate: 'ABC1A21', year: 2023, color: 'Preto' },
    { brand: 'Toyota', model: 'Hilux', plate: 'ABC1A22', year: 2020, color: 'Prata' },
    { brand: 'Volkswagen', model: 'Polo', plate: 'ABC1A23', year: 2021, color: 'Azul' },
    { brand: 'Fiat', model: 'Toro', plate: 'ABC1A24', year: 2022, color: 'Cinza' },
    { brand: 'Honda', model: 'Fit', plate: 'ABC1A25', year: 2019, color: 'Branco' },
  ];

  const vehicles = [];
  for (let i = 0; i < vehiclesData.length; i += 1) {
    const v = vehiclesData[i];
    const client = clients[i % clients.length];
    const vehicle = await prisma.vehicle.upsert({
      where: { plate: v.plate },
      update: {},
      create: {
        clientId: client.id,
        plate: v.plate,
        brand: v.brand,
        model: v.model,
        year: v.year,
        color: v.color,
        mileage: randomInt(5000, 120000),
      },
    });
    vehicles.push(vehicle);
  }
  console.log('Veículos criados.');

  // ---------- SERVIÇOS ----------
  const servicesData = [
    { name: 'Troca de óleo', description: 'Troca de óleo do motor e filtro', defaultPrice: 120 },
    { name: 'Alinhamento', description: 'Alinhamento de direção', defaultPrice: 90 },
    { name: 'Balanceamento', description: 'Balanceamento das rodas', defaultPrice: 70 },
    { name: 'Diagnóstico eletrônico', description: 'Leitura de códigos de falha', defaultPrice: 150 },
    { name: 'Troca de pastilhas de freio', description: 'Substituição das pastilhas', defaultPrice: 180 },
    { name: 'Funilaria', description: 'Reparo de lataria', defaultPrice: 400 },
    { name: 'Pintura', description: 'Pintura de peças ou veículo completo', defaultPrice: 600 },
    { name: 'Polimento', description: 'Polimento e cristalização da pintura', defaultPrice: 250 },
    { name: 'Revisão completa', description: 'Revisão geral do veículo', defaultPrice: 350 },
    { name: 'Troca de suspensão', description: 'Substituição de componentes da suspensão', defaultPrice: 500 },
  ];

  const services = [];
  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    const service = existing ?? (await prisma.service.create({ data: s }));
    services.push(service);
  }
  console.log('Serviços criados.');

  // ---------- PEÇAS ----------
  const partsData = [
    { name: 'Filtro de óleo', code: 'COD-001', manufacturer: 'Fram', price: 35, stock: 40 },
    { name: 'Óleo motor 5W30 (litro)', code: 'COD-002', manufacturer: 'Mobil', price: 45, stock: 60 },
    { name: 'Pastilha de freio dianteira', code: 'COD-003', manufacturer: 'Bosch', price: 120, stock: 25 },
    { name: 'Pastilha de freio traseira', code: 'COD-004', manufacturer: 'Bosch', price: 110, stock: 25 },
    { name: 'Amortecedor dianteiro', code: 'COD-005', manufacturer: 'Cofap', price: 280, stock: 15 },
    { name: 'Amortecedor traseiro', code: 'COD-006', manufacturer: 'Cofap', price: 260, stock: 15 },
    { name: 'Correia dentada', code: 'COD-007', manufacturer: 'Gates', price: 150, stock: 20 },
    { name: 'Vela de ignição', code: 'COD-008', manufacturer: 'NGK', price: 30, stock: 80 },
    { name: 'Bateria 60Ah', code: 'COD-009', manufacturer: 'Moura', price: 420, stock: 10 },
    { name: 'Filtro de ar', code: 'COD-010', manufacturer: 'Mahle', price: 40, stock: 45 },
    { name: 'Filtro de combustível', code: 'COD-011', manufacturer: 'Mahle', price: 55, stock: 35 },
    { name: 'Disco de freio', code: 'COD-012', manufacturer: 'Fremax', price: 190, stock: 18 },
    { name: 'Bieleta', code: 'COD-013', manufacturer: 'Nakata', price: 60, stock: 30 },
    { name: 'Kit de embreagem', code: 'COD-014', manufacturer: 'Sachs', price: 550, stock: 8 },
    { name: 'Radiador', code: 'COD-015', manufacturer: 'Valeo', price: 380, stock: 12 },
  ];

  const parts = [];
  for (const p of partsData) {
    const part = await prisma.part.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
    parts.push(part);
  }
  console.log('Peças criadas.');

  // ---------- ORDENS DE SERVIÇO ----------
  const statusFlow: WorkOrderStatus[] = [
    'EM_DIAGNOSTICO',
    'AGUARDANDO_APROVACAO',
    'EM_MANUTENCAO',
    'EM_FUNILARIA',
    'EM_PINTURA',
    'EM_TESTE',
    'PRONTO',
    'ENTREGUE',
  ];

  const problems = [
    'Ruído estranho ao frear',
    'Veículo puxando para o lado durante a condução',
    'Luz de injeção acesa no painel',
    'Pane elétrica intermitente',
    'Batida na lateral do veículo (colisão leve)',
    'Superaquecimento do motor',
    'Troca de óleo e revisão programada',
    'Suspensão fazendo barulho em buracos',
    'Amassado no para-choque traseiro',
    'Veículo não liga',
    'Ar condicionado sem gelar',
    'Vibração no volante em alta velocidade',
  ];

  const existingOrdersCount = await prisma.workOrder.count();
  if (existingOrdersCount === 0) {
    for (let i = 0; i < 18; i += 1) {
      const vehicle = vehicles[i % vehicles.length];
      const entryDate = daysAgo(randomInt(1, 45));
      const progressIndex = randomInt(0, statusFlow.length - 1);
      const finalStatus = i % 7 === 0 ? 'CANCELADO' : statusFlow[progressIndex];
      const estimatedDelivery = daysFromNow(randomInt(-3, 15));
      const laborCost = randomInt(80, 200);

      const chosenServices = pickMany(services, randomInt(1, 3));
      const chosenParts = pickMany(parts, randomInt(0, 3));

      const workOrder = await prisma.workOrder.create({
        data: {
          clientId: vehicle.clientId,
          vehicleId: vehicle.id,
          problemDescription: pick(problems),
          diagnosis:
            progressIndex > 0
              ? 'Diagnóstico realizado: peças e serviços necessários identificados.'
              : null,
          status: finalStatus,
          entryDate,
          estimatedDelivery,
          completedAt: finalStatus === 'ENTREGUE' ? daysAgo(randomInt(0, 5)) : null,
          laborCost,
          internalNotes: 'Cliente ciente dos prazos.',
          publicNotes: 'Acompanhe o andamento do seu veículo por aqui.',
          services: {
            create: chosenServices.map((s) => ({ serviceId: s.id, price: s.defaultPrice })),
          },
          parts: {
            create: chosenParts.map((p) => ({
              partId: p.id,
              quantity: randomInt(1, 2),
              unitPrice: p.price,
            })),
          },
        },
      });

      // Histórico de status (timeline)
      const historySteps = statusFlow.slice(0, progressIndex + 1);
      for (let s = 0; s < historySteps.length; s += 1) {
        await prisma.workOrderStatusHistory.create({
          data: {
            workOrderId: workOrder.id,
            status: historySteps[s],
            note: s === 0 ? 'Veículo recebido na oficina.' : undefined,
            userId: pick(users).id,
            createdAt: daysAgo(randomInt(0, 45) - s),
          },
        });
      }
      if (finalStatus === 'CANCELADO') {
        await prisma.workOrderStatusHistory.create({
          data: {
            workOrderId: workOrder.id,
            status: 'CANCELADO',
            note: 'Cliente optou por não aprovar o orçamento.',
            userId: pick(users).id,
          },
        });
      }

      // Pagamento parcial em algumas ordens
      if (['PRONTO', 'ENTREGUE'].includes(finalStatus) || rng() > 0.5) {
        const servicesTotal = chosenServices.reduce((sum, s) => sum + Number(s.defaultPrice), 0);
        const partsTotal = chosenParts.reduce((sum, p) => sum + Number(p.price), 0);
        const total = servicesTotal + partsTotal + laborCost;
        const paidAmount = finalStatus === 'ENTREGUE' ? total : Math.round(total * 0.4);

        if (paidAmount > 0) {
          await prisma.payment.create({
            data: {
              workOrderId: workOrder.id,
              amount: paidAmount,
              method: pick<PaymentMethod>(['PIX', 'CARTAO_CREDITO', 'DINHEIRO', 'CARTAO_DEBITO']),
              notes: finalStatus === 'ENTREGUE' ? 'Pagamento integral na entrega.' : 'Sinal pago na aprovação do orçamento.',
            },
          });
        }
      }
    }
    console.log('Ordens de serviço, histórico e pagamentos criados.');
  } else {
    console.log('Ordens de serviço já existiam, etapa ignorada.');
  }

  console.log('Seed finalizado com sucesso.');
  console.log('----------------------------------------');
  console.log('Usuário de demonstração (senha: 123456):');
  console.log('  admin@autocontrol.com.br      (Administrador)');
  console.log('----------------------------------------');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
