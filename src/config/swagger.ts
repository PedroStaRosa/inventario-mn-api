import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Inventário MN - API',
        version: '1.0.0',
        description: 'API REST para controle e fluxo de inventário de produtos. Permite inventários periódicos, acompanhamento de itens inventariados e sugestões de produtos prioritários.',
        contact: {
            name: 'Suporte API',
        },
    },
    servers: [
        {
            url: `http://localhost:${process.env.EXPRESS_PORT || 3000}`,
            description: 'Servidor de desenvolvimento',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Token JWT obtido através do endpoint /api/v1/auth',
            },
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        description: 'Mensagem de erro',
                    },
                },
            },
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID do usuário',
                    },
                    name: {
                        type: 'string',
                        description: 'Nome do usuário',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        description: 'Email do usuário',
                    },
                    role: {
                        type: 'string',
                        enum: ['USER', 'ADMIN'],
                        description: 'Papel do usuário',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Data de criação',
                    },
                },
            },
            Product: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID do produto',
                    },
                    name: {
                        type: 'string',
                        description: 'Nome do produto',
                    },
                    code: {
                        type: 'string',
                        description: 'Código do produto',
                    },
                    description: {
                        type: 'string',
                        description: 'Descrição do produto',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Data de criação',
                    },
                },
            },
            Inventory: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID do inventário',
                    },
                    name: {
                        type: 'string',
                        description: 'Nome do inventário',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Data de criação',
                    },
                },
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    token: {
                        type: 'string',
                        description: 'Token JWT de acesso',
                    },
                    refreshToken: {
                        type: 'string',
                        description: 'Token de refresh',
                    },
                    user: {
                        $ref: '#/components/schemas/User',
                    },
                },
            },
        },
    },
    tags: [
        {
            name: 'Autenticação',
            description: 'Endpoints para autenticação e gerenciamento de usuários',
        },
        {
            name: 'Produtos',
            description: 'Endpoints para gerenciamento de produtos',
        },
        {
            name: 'Inventário',
            description: 'Endpoints para gerenciamento de inventários',
        },
    ],
};

const options = {
    definition: swaggerDefinition,
    apis: ['./src/modules/**/routes.ts', './src/modules/**/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

