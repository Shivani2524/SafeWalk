const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🛡️ SafeWalk API',
      version: '1.0.0',
      description: `
## AI-Powered Women Safety Backend

A complete REST API for the SafeWalk application providing:
- 🚨 SOS emergency alerts with real-time Socket.io broadcast
- 📍 Live location tracking
- 👥 Trusted contacts management  
- 🤐 Safe word detection & auto-SOS
- 🚶 Journey tracking system

All endpoints accept and return **JSON**. Responses follow the format:
\`\`\`json
{ "success": true/false, "message": "...", "data": {} }
\`\`\`
      `,
      contact: {
        name: 'SafeWalk Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local Development Server'
      }
    ],
    tags: [
      { name: 'Health',    description: 'Server health check' },
      { name: 'Auth',      description: 'User registration and login' },
      { name: 'SOS',       description: '🚨 Emergency SOS alerts' },
      { name: 'Location',  description: '📍 Live location tracking' },
      { name: 'Contacts',  description: '👥 Trusted contacts management' },
      { name: 'Safe Word', description: '🤐 Safe word detection' },
      { name: 'Journey',   description: '🚶 Journey tracking' },
    ],
    paths: {

      // ─── HEALTH ──────────────────────────────────────────────────
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          description: 'Returns server status. Redirects to the API reference page.',
          responses: {
            200: {
              description: 'Server is healthy',
              content: { 'application/json': { example: { success: true, message: 'SafeWalk Backend is healthy and operational' } } }
            }
          }
        }
      },

      // ─── AUTH ─────────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password', 'safeWord'],
                  properties: {
                    name:     { type: 'string',  example: 'Jane Doe' },
                    email:    { type: 'string',  example: 'jane@example.com' },
                    password: { type: 'string',  example: 'securepassword123' },
                    safeWord: { type: 'string',  example: 'red balloon' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User registered successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    data: { id: '64839a9c8d5a1b32947d8b5a', name: 'Jane Doe', email: 'jane@example.com' }
                  }
                }
              }
            },
            400: { description: 'Validation error or user already exists' }
          }
        }
      },

      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and get JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email:    { type: 'string', example: 'jane@example.com' },
                    password: { type: 'string', example: 'securepassword123' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  example: { success: true, token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
                }
              }
            },
            401: { description: 'Invalid credentials' }
          }
        }
      },

      // ─── SOS ──────────────────────────────────────────────────────
      '/api/sos/trigger': {
        post: {
          tags: ['SOS'],
          summary: '🚨 Trigger an SOS alert',
          description: 'Creates an SOS alert with status ACTIVE, saves to MongoDB, and emits a `sos_alert` Socket.io event to all listeners.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'latitude', 'longitude'],
                  properties: {
                    userId:    { type: 'string',  example: '64839a9c8d5a1b32947d8b5a' },
                    latitude:  { type: 'number',  example: 12.9715987 },
                    longitude: { type: 'number',  example: 77.5945627 },
                    type: {
                      type: 'string',
                      enum: ['manual', 'voice', 'safe_word'],
                      example: 'manual'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'SOS triggered successfully',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    message: 'SOS triggered successfully',
                    data: { _id: '6483b1a8...', userId: '...', latitude: 12.97, longitude: 77.59, type: 'manual', status: 'ACTIVE' }
                  }
                }
              }
            },
            400: { description: 'Missing required fields' },
            404: { description: 'User not found' }
          }
        }
      },

      '/api/sos/cancel': {
        post: {
          tags: ['SOS'],
          summary: 'Cancel an active SOS alert',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['sosId'],
                  properties: {
                    sosId: { type: 'string', example: '6483b1a88d5a1b32947d8b7e' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'SOS cancelled',
              content: {
                'application/json': {
                  example: { success: true, message: 'SOS cancelled successfully', data: { status: 'CANCELLED' } }
                }
              }
            },
            404: { description: 'SOS alert not found' }
          }
        }
      },

      '/api/sos/history': {
        get: {
          tags: ['SOS'],
          summary: 'Get SOS history for a user',
          parameters: [
            {
              name: 'userId',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              example: '64839a9c8d5a1b32947d8b5a'
            }
          ],
          responses: {
            200: {
              description: 'List of SOS alerts',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [
                      { _id: '...', userId: '...', latitude: 12.97, longitude: 77.59, type: 'manual', status: 'ACTIVE', createdAt: '2026-06-12T15:52:00.000Z' }
                    ]
                  }
                }
              }
            }
          }
        }
      },

      // ─── LOCATION ─────────────────────────────────────────────────
      '/api/location/update': {
        post: {
          tags: ['Location'],
          summary: 'Update user live location',
          description: 'Saves coordinates to the user profile and emits a `location_update` Socket.io event.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'latitude', 'longitude'],
                  properties: {
                    userId:    { type: 'string',  example: '64839a9c8d5a1b32947d8b5a' },
                    latitude:  { type: 'number',  example: 12.9715987 },
                    longitude: { type: 'number',  example: 77.5945627 }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Location updated',
              content: {
                'application/json': {
                  example: { success: true, message: 'Location updated successfully', data: { userId: '...', latitude: 12.97, longitude: 77.59 } }
                }
              }
            }
          }
        }
      },

      '/api/location/{userId}': {
        get: {
          tags: ['Location'],
          summary: 'Get latest location for a user',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: '64839a9c8d5a1b32947d8b5a'
            }
          ],
          responses: {
            200: {
              description: 'User location',
              content: {
                'application/json': {
                  example: { success: true, data: { userId: '...', name: 'Jane Doe', latitude: 12.97, longitude: 77.59, journeyActive: false } }
                }
              }
            },
            404: { description: 'User not found' }
          }
        }
      },

      // ─── CONTACTS ─────────────────────────────────────────────────
      '/api/contacts/add': {
        post: {
          tags: ['Contacts'],
          summary: 'Add a trusted emergency contact',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'name', 'phone'],
                  properties: {
                    userId: { type: 'string',  example: '64839a9c8d5a1b32947d8b5a' },
                    name:   { type: 'string',  example: 'John Doe' },
                    phone:  { type: 'string',  example: '+91-9876543210' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Contact added',
              content: {
                'application/json': {
                  example: { success: true, message: 'Contact added successfully', data: { _id: '...', userId: '...', name: 'John Doe', phone: '+91-9876543210' } }
                }
              }
            }
          }
        }
      },

      '/api/contacts/{userId}': {
        get: {
          tags: ['Contacts'],
          summary: 'Get all contacts for a user',
          parameters: [
            {
              name: 'userId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: '64839a9c8d5a1b32947d8b5a'
            }
          ],
          responses: {
            200: {
              description: 'List of contacts',
              content: {
                'application/json': {
                  example: { success: true, data: [{ _id: '...', name: 'John Doe', phone: '+91-9876543210' }] }
                }
              }
            }
          }
        }
      },

      '/api/contacts/{id}': {
        delete: {
          tags: ['Contacts'],
          summary: 'Delete a contact by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: '6483a9de8d5a1b32947d8b6c'
            }
          ],
          responses: {
            200: {
              description: 'Contact deleted',
              content: {
                'application/json': {
                  example: { success: true, message: 'Contact deleted successfully' }
                }
              }
            },
            404: { description: 'Contact not found' }
          }
        }
      },

      // ─── SAFE WORD ────────────────────────────────────────────────
      '/api/safeword/set': {
        post: {
          tags: ['Safe Word'],
          summary: 'Set a safe word for the user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'word'],
                  properties: {
                    userId: { type: 'string', example: '64839a9c8d5a1b32947d8b5a' },
                    word:   { type: 'string', example: 'red balloon' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Safe word updated',
              content: {
                'application/json': {
                  example: { success: true, message: 'Safe word updated successfully', data: { userId: '...', safeWord: 'red balloon' } }
                }
              }
            }
          }
        }
      },

      '/api/safeword/trigger': {
        post: {
          tags: ['Safe Word'],
          summary: '🤐 Trigger SOS via safe word detection',
          description: 'Automatically creates an SOS of type `safe_word` and emits socket alerts.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: {
                    userId: { type: 'string', example: '64839a9c8d5a1b32947d8b5a' }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'SOS triggered via safe word',
              content: {
                'application/json': {
                  example: { success: true, message: '🚨 Safe word detected. SOS triggered automatically!' }
                }
              }
            }
          }
        }
      },

      // ─── JOURNEY ──────────────────────────────────────────────────
      '/api/journey/start': {
        post: {
          tags: ['Journey'],
          summary: 'Start a journey',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'startLocation'],
                  properties: {
                    userId: { type: 'string', example: '64839a9c8d5a1b32947d8b5a' },
                    startLocation: {
                      type: 'object',
                      properties: {
                        latitude:  { type: 'number', example: 12.9715987 },
                        longitude: { type: 'number', example: 77.5945627 }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Journey started',
              content: {
                'application/json': {
                  example: { success: true, message: 'Journey started successfully', data: { _id: '...', status: 'active' } }
                }
              }
            }
          }
        }
      },

      '/api/journey/end': {
        post: {
          tags: ['Journey'],
          summary: 'End an active journey',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: {
                    userId: { type: 'string', example: '64839a9c8d5a1b32947d8b5a' },
                    endLocation: {
                      type: 'object',
                      properties: {
                        latitude:  { type: 'number', example: 12.971888 },
                        longitude: { type: 'number', example: 77.595012 }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Journey completed',
              content: {
                'application/json': {
                  example: { success: true, message: 'Journey ended successfully', data: { status: 'completed' } }
                }
              }
            }
          }
        }
      },

      '/api/journey/history': {
        get: {
          tags: ['Journey'],
          summary: 'Get journey history for a user',
          parameters: [
            {
              name: 'userId',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              example: '64839a9c8d5a1b32947d8b5a'
            }
          ],
          responses: {
            200: {
              description: 'List of journeys',
              content: {
                'application/json': {
                  example: {
                    success: true,
                    data: [{ _id: '...', status: 'completed', startLocation: { latitude: 12.97, longitude: 77.59 }, createdAt: '2026-06-12T15:52:00.000Z' }]
                  }
                }
              }
            }
          }
        }
      }

    } // end paths
  },
  apis: [] // We use inline spec above, no JSDoc scanning needed
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
