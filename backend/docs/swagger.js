const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.3',
		info: {
			title: 'Pokémon Card Tracker API',
			description: 'REST-API för kort, serier, set, typer och användare.',
			version: '1.0.0',
		},
		servers: [{ url: 'http://localhost:5000'}],
		components: {
			securitySchemes: {
				bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
			},
			schemas: {
				Card: {
					type: 'object',
					properties: {
						id: { type: 'integer', example: 123 },
						name: { type: 'string', example: 'Charizard' },
						series_id: { type: 'integer', nullable: true },
						set_id: { type: 'integer' },
						type_id: { type: 'integer', nullable: true },
						no_in_set: { type: 'integer', nullable: true },
						image_small: { type: 'string', nullable: true },
						image_large: { type: 'string', nullable: true },
						rarity: { type: 'string', nullable: true },
						price_low: { type: 'number', nullable: true },
						price_mid: { type: 'number', nullable: true },
						price_high: { type: 'number', nullable: true },
						price_market: { type: 'number', nullable: true },
						created_at: { type: 'string', format: 'date-time' },
						updated_at: { type: 'string', format: 'date-time' }
					},
					required: ['name', 'set_id']
				}
			}
		}
	},
	apis: ['src/routes/**/*.js', 'src/controllers/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = { swaggerSpec };