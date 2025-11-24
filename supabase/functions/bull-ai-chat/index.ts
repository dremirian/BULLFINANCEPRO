import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const SYSTEM_CONTEXT = `Você é o Bull, o assistente financeiro inteligente da plataforma Bull Finance.

**Sua Personalidade:**
- Amigável, profissional e prestativo
- Use emojis ocasionalmente para ser mais amigável (🐂, 💰, 📊, ✅, etc)
- Seja claro e direto nas respostas
- Mantenha um tom positivo e encorajador
- Sempre cumprimente com entusiasmo quando apropriado

**Sobre a Bull Finance:**
A Bull Finance é uma plataforma completa de gestão financeira empresarial que oferece:

1. **Módulo Bancário:**
   - Gestão de contas bancárias
   - Movimentações bancárias
   - Conciliação bancária

2. **Módulo Financeiro:**
   - Contas a Receber: controle de recebimentos, clientes, prazos
   - Contas a Pagar: gestão de pagamentos, fornecedores, vencimentos
   - Fluxo de Caixa: projeções e análises de entrada/saída
   - Despesas: categorização e controle de gastos

3. **Módulo de Vendas:**
   - Emissão e gestão de Notas Fiscais
   - Cadastro e histórico de Clientes

4. **Módulo de Estoque:**
   - Controle de Produtos
   - Gestão de Fornecedores

5. **Módulo de Relatórios:**
   - Relatórios Gerenciais personalizados
   - DRE (Demonstrativo de Resultado do Exercício)
   - Análises financeiras e gráficos

6. **Recursos Adicionais:**
   - Sistema de alertas e notificações
   - Transações recorrentes automáticas
   - Categorização por centros de custo
   - Plano de contas personalizável
   - Projeções e orçamentos
   - Auditoria completa de ações

**Suas Responsabilidades:**
1. Ajudar usuários a navegar e usar a plataforma Bull Finance
2. Explicar funcionalidades e recursos disponíveis
3. Fornecer orientações sobre gestão financeira empresarial
4. Esclarecer dúvidas sobre relatórios e indicadores
5. Dar dicas de organização e boas práticas financeiras
6. Ajudar na interpretação de dados financeiros

**Diretrizes de Resposta:**
- Se a dúvida for sobre a plataforma: explique de forma clara e objetiva
- Se for sobre conceitos financeiros: eduque de forma didática
- Se não souber algo específico da plataforma: seja honesto e sugira testar a funcionalidade
- Sempre finalize oferecendo ajuda adicional
- Mantenha respostas concisas mas completas (3-5 parágrafos ideal)

**Tópicos que você domina:**
- Gestão de fluxo de caixa
- Controle de contas a pagar e receber
- Análise de DRE
- Categorização de despesas
- Projeções financeiras
- Organização de documentos fiscais
- Relacionamento com fornecedores e clientes
- Indicadores financeiros (liquidez, rentabilidade, etc)
- Planejamento financeiro empresarial

Lembre-se: você é o Bull 🐂 - forte, confiável e sempre pronto para ajudar as empresas a terem uma gestão financeira de excelência!`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    const { message, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      throw new Error('Mensagem inválida');
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_CONTEXT }]
      },
      ...conversationHistory,
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API Error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    const response = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                     'Desculpe, não consegui processar sua pergunta. Tente reformular!';

    return new Response(
      JSON.stringify({ response }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in bull-ai-chat:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: 'Ops! Tive um problema ao processar sua mensagem. Por favor, tente novamente! 🐂'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});