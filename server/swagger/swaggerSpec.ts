import type { OpenAPIV3 } from 'openapi-types';

/**
 * LocaLink — OpenAPI 3.0 Specification
 *
 * All endpoints live under /api/v1/*
 * Authentication: Bearer JWT in Authorization header OR httpOnly accessToken cookie
 */
const swaggerSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'LocaLink API',
    version: '1.0.0',
    description:
      'Real-time friend location sharing API. ' +
      'All authenticated endpoints accept a Bearer JWT via the `Authorization` header ' +
      'or an `accessToken` httpOnly cookie set at login.',
    contact: {
      name: 'LocaLink',
      url: 'http://localhost:3000',
    },
  },
  servers: [
    { url: '/api/v1', description: 'Current version' },
    { url: '/api', description: 'Legacy (no version prefix)' },
  ],
  tags: [
    { name: 'Auth', description: 'Registration, login, token refresh, password management' },
    { name: 'Users', description: 'User profile management' },
    { name: 'Friends', description: 'Friend requests and friendship management' },
    { name: 'Location', description: 'Real-time location sharing and history' },
    { name: 'Groups', description: 'Location-sharing groups' },
    { name: 'Notifications', description: 'In-app notification management' },
    { name: 'Saved Places', description: 'Personal saved locations (home, work, etc.)' },
    { name: 'SMS', description: 'Twilio SMS sending and OTP delivery' },
    { name: 'Upload', description: 'File upload (images, PDFs)' },
    { name: 'Health', description: 'Service health check' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token. Obtain via POST /auth/login or /auth/refresh-token.',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
        description: 'httpOnly cookie set automatically at login.',
      },
    },
    schemas: {
      // ── Generic envelope ────────────────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Success' },
          data: {},
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Unauthorized' },
          data: { nullable: true, example: null },
        },
      },
      // ── User ────────────────────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Rahim Uddin' },
          email: { type: 'string', format: 'email', example: 'rahim@example.com' },
          phone: { type: 'string', nullable: true, example: '+8801712345678' },
          avatar: { type: 'string', nullable: true, example: '/uploads/avatar.jpg' },
          bio: { type: 'string', nullable: true, example: 'Hi, I am using LocaLink!' },
          provider: { type: 'string', enum: ['local', 'google', 'facebook'], example: 'local' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          isOnline: { type: 'boolean', example: true },
          lastSeen: { type: 'string', format: 'date-time' },
          sharingLocation: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      // ── Auth ────────────────────────────────────────────────────────────
      RegisterBody: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Rahim Uddin' },
          email: { type: 'string', format: 'email', example: 'rahim@example.com' },
          password: { type: 'string', minLength: 6, example: 'Secret123!' },
          phone: { type: 'string', example: '+8801712345678' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'rahim@example.com' },
          password: { type: 'string', example: 'Secret123!' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
      },
      SocialLoginBody: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string', description: 'Google credential / Facebook access token' },
        },
      },
      // ── Location ────────────────────────────────────────────────────────
      LocationPayload: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
          latitude: { type: 'number', example: 23.8103 },
          longitude: { type: 'number', example: 90.4125 },
          accuracy: { type: 'number', nullable: true, example: 15.0 },
          altitude: { type: 'number', nullable: true, example: 5.0 },
          speed: { type: 'number', nullable: true, example: 1.2 },
          heading: { type: 'number', nullable: true, example: 270.0 },
          address: { type: 'string', nullable: true, example: 'Gulshan, Dhaka' },
          city: { type: 'string', nullable: true, example: 'Dhaka' },
          country: { type: 'string', nullable: true, example: 'Bangladesh' },
        },
      },
      Location: {
        allOf: [
          { $ref: '#/components/schemas/LocationPayload' },
          {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              userId: { type: 'integer' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        ],
      },
      FriendLocation: {
        allOf: [
          { $ref: '#/components/schemas/LocationPayload' },
          {
            type: 'object',
            properties: {
              userId: { type: 'integer' },
              updatedAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  name: { type: 'string' },
                  avatar: { type: 'string', nullable: true },
                  isOnline: { type: 'boolean' },
                  sharingLocation: { type: 'boolean' },
                },
              },
            },
          },
        ],
      },
      // ── Friend ──────────────────────────────────────────────────────────
      FriendRequest: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          senderId: { type: 'integer' },
          receiverId: { type: 'integer' },
          status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
          message: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          sender: { $ref: '#/components/schemas/User' },
          receiver: { $ref: '#/components/schemas/User' },
        },
      },
      // ── Group ───────────────────────────────────────────────────────────
      Group: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string', example: 'Family' },
          description: { type: 'string', nullable: true },
          avatar: { type: 'string', nullable: true },
          createdById: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          members: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                userId: { type: 'integer' },
                role: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
                joinedAt: { type: 'string', format: 'date-time' },
                user: { $ref: '#/components/schemas/User' },
              },
            },
          },
        },
      },
      // ── Notification ────────────────────────────────────────────────────
      Notification: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          type: {
            type: 'string',
            enum: ['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'GROUP_INVITE', 'GROUP_JOINED', 'LOCATION_ALERT', 'SYSTEM'],
          },
          title: { type: 'string' },
          body: { type: 'string' },
          data: { type: 'object', nullable: true },
          isRead: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // ── Saved Place ─────────────────────────────────────────────────────
      SavedPlace: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userId: { type: 'integer' },
          name: { type: 'string', example: 'Home' },
          address: { type: 'string', nullable: true, example: 'Mirpur, Dhaka' },
          latitude: { type: 'number', example: 23.8103 },
          longitude: { type: 'number', example: 90.4125 },
          icon: { type: 'string', nullable: true, example: '🏠' },
          color: { type: 'string', nullable: true, example: '#22c55e' },
          type: { type: 'string', enum: ['HOME', 'WORK', 'SCHOOL', 'GYM', 'OTHER'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid JWT',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Access denied. No token provided.', data: null },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Not found', data: null },
          },
        },
      },
      BadRequest: {
        description: 'Invalid request body or parameters',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Bad Request', data: null },
          },
        },
      },
      TooManyRequests: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, message: 'Too many requests. Please try again later.', data: null },
          },
        },
      },
    },
  },

  // ── Security (applied globally; individual routes may override) ──────────
  security: [{ bearerAuth: [] }, { cookieAuth: [] }],

  paths: {
    // ════════════════════════════════════════════════════════════════════════
    //  HEALTH
    // ════════════════════════════════════════════════════════════════════════
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health check',
        security: [],
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                example: { success: true, message: 'LocaLink API is running', timestamp: '2026-08-24T10:00:00.000Z' },
              },
            },
          },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  AUTH
    // ════════════════════════════════════════════════════════════════════════
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new account',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } },
        },
        responses: {
          201: {
            description: 'Account created',
            content: {
              'application/json': {
                example: { success: true, message: 'Account created successfully', data: { id: 1, name: 'Rahim Uddin', email: 'rahim@example.com' } },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          409: { description: 'Email already registered' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } },
        },
        responses: {
          200: {
            description: 'Login successful. Sets accessToken + refreshToken cookies.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/LoginResponse' } } },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { description: 'Invalid email or password' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout (clears cookies + invalidates refresh token)',
        responses: {
          200: { description: 'Logged out successfully' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        responses: {
          200: {
            description: 'Current user data',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/refresh-token': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token using the refreshToken cookie',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: 'New access token issued',
            content: {
              'application/json': {
                example: { success: true, message: 'Token refreshed', data: { token: 'eyJ...' } },
              },
            },
          },
          401: { description: 'Refresh token missing or invalid' },
        },
      },
    },
    '/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset email',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset email sent (if account exists)' },
          400: { $ref: '#/components/responses/BadRequest' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using email token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token: { type: 'string' },
                  newPassword: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successful' },
          400: { description: 'Token is invalid or has expired' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/update-password': {
      patch: {
        tags: ['Auth'],
        summary: 'Update password (requires current password)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password updated' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/social-login/google': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in / sign up with Google',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SocialLoginBody' } } },
        },
        responses: {
          200: {
            description: 'Authenticated. Sets cookies.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/LoginResponse' } } },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/social-login/facebook': {
      post: {
        tags: ['Auth'],
        summary: 'Sign in / sign up with Facebook',
        security: [],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/SocialLoginBody' } } },
        },
        responses: {
          200: {
            description: 'Authenticated. Sets cookies.',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/LoginResponse' } } },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  USERS
    // ════════════════════════════════════════════════════════════════════════
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users',
        responses: {
          200: {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/users/profile': {
      patch: {
        tags: ['Users'],
        summary: 'Update own profile',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  bio: { type: 'string' },
                  phone: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'User data',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/User' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user account',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'User deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  FRIENDS
    // ════════════════════════════════════════════════════════════════════════
    '/friends': {
      get: {
        tags: ['Friends'],
        summary: 'Get my friends list',
        responses: {
          200: {
            description: 'Array of friends',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/friends/search': {
      get: {
        tags: ['Friends'],
        summary: 'Search users by name or email',
        parameters: [
          { name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 2 }, description: 'Search term (min 2 chars)' },
        ],
        responses: {
          200: { description: 'Matching users (excludes self and existing friends)' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/friends/requests': {
      post: {
        tags: ['Friends'],
        summary: 'Send a friend request',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['receiverId'],
                properties: {
                  receiverId: { type: 'integer' },
                  message: { type: 'string', maxLength: 500 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Request sent' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          409: { description: 'Request already exists' },
        },
      },
    },
    '/friends/requests/accept-all': {
      post: {
        tags: ['Friends'],
        summary: 'Accept all pending friend requests',
        responses: {
          200: { description: 'All pending requests accepted' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/friends/requests/pending': {
      get: {
        tags: ['Friends'],
        summary: 'Get pending incoming friend requests',
        responses: {
          200: {
            description: 'Pending requests',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/FriendRequest' } } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/friends/requests/sent': {
      get: {
        tags: ['Friends'],
        summary: 'Get sent friend requests',
        responses: {
          200: { description: 'Sent requests' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/friends/requests/history': {
      get: {
        tags: ['Friends'],
        summary: 'Get friend request history (last 30 days)',
        responses: {
          200: { description: 'Request history' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/friends/requests/{id}': {
      patch: {
        tags: ['Friends'],
        summary: 'Accept or reject a friend request',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { type: 'string', enum: ['ACCEPTED', 'REJECTED'] } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Request updated' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Friends'],
        summary: 'Cancel a sent friend request',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Request cancelled' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/friends/{friendId}': {
      delete: {
        tags: ['Friends'],
        summary: 'Remove a friend',
        parameters: [{ name: 'friendId', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Friend removed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  LOCATION
    // ════════════════════════════════════════════════════════════════════════
    '/location/update': {
      put: {
        tags: ['Location'],
        summary: 'Update current location (REST fallback — prefer Socket.IO)',
        description:
          'Upserts the current position and appends to history. ' +
          'Also broadcasts `location:broadcast` via Socket.IO to the caller\'s personal room. ' +
          'Prefer the `location:update` socket event for continuous GPS updates.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LocationPayload' } } },
        },
        responses: {
          200: {
            description: 'Location updated',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Location' } } },
                  ],
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/location/me': {
      get: {
        tags: ['Location'],
        summary: "Get my current stored location",
        responses: {
          200: {
            description: 'My location (null if never set)',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Location' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/location/friends': {
      get: {
        tags: ['Location'],
        summary: "Get all friends' current locations",
        responses: {
          200: {
            description: "Friends' locations with user info",
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/FriendLocation' } } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/location/history/stats': {
      get: {
        tags: ['Location'],
        summary: 'Get location history statistics (distance, cities, speed)',
        responses: {
          200: {
            description: 'Stats object',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Stats retrieved',
                  data: {
                    totalEntries: 320,
                    uniqueCities: 3,
                    estimatedDistanceKm: 47.2,
                    avgSpeedKmh: 18.5,
                    firstRecorded: '2026-08-01T08:00:00.000Z',
                    lastRecorded: '2026-08-24T10:00:00.000Z',
                    topCities: ['Dhaka', 'Gazipur', 'Narayanganj'],
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/location/history': {
      get: {
        tags: ['Location'],
        summary: 'Get location history (paginated, filterable by date)',
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-08-01' },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' }, example: '2026-08-24' },
          { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 500, default: 100 } },
          { name: 'skip', in: 'query', schema: { type: 'integer', minimum: 0, default: 0 } },
        ],
        responses: {
          200: { description: 'Paginated history records' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Location'],
        summary: 'Clear all location history',
        responses: {
          200: { description: 'History cleared' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/location/sharing': {
      patch: {
        tags: ['Location'],
        summary: 'Toggle location sharing on/off',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sharing'],
                properties: { sharing: { type: 'boolean', example: true } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Sharing preference updated. Broadcasts `sharing:changed` via socket to friends.' },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  GROUPS
    // ════════════════════════════════════════════════════════════════════════
    '/groups': {
      post: {
        tags: ['Groups'],
        summary: 'Create a new group',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Group created',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Group' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      get: {
        tags: ['Groups'],
        summary: 'Get my groups (all groups I am a member of)',
        responses: {
          200: {
            description: 'List of groups',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Group' } } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/groups/{id}': {
      get: {
        tags: ['Groups'],
        summary: 'Get group by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: {
            description: 'Group data with members',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/Group' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Groups'],
        summary: 'Update group metadata (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  avatar: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Group updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'Not group admin' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Groups'],
        summary: 'Delete a group (admin only)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Group deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'Not group admin' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/groups/{id}/members': {
      post: {
        tags: ['Groups'],
        summary: 'Add a member to the group',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: { userId: { type: 'integer' } },
              },
            },
          },
        },
        responses: {
          201: { description: 'Member added' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          409: { description: 'User is already a member' },
        },
      },
    },
    '/groups/{id}/members/{userId}': {
      delete: {
        tags: ['Groups'],
        summary: 'Remove a member from the group (admin only)',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Member removed' },
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { description: 'Not group admin' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/groups/{id}/leave': {
      post: {
        tags: ['Groups'],
        summary: 'Leave a group (members only; admin cannot leave own group)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Left group successfully' },
          400: { description: 'Admin cannot leave their own group' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  NOTIFICATIONS
    // ════════════════════════════════════════════════════════════════════════
    '/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get paginated notifications',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: 'Paginated notifications',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            notifications: { type: 'array', items: { $ref: '#/components/schemas/Notification' } },
                            total: { type: 'integer' },
                            page: { type: 'integer' },
                            totalPages: { type: 'integer' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/unread-count': {
      get: {
        tags: ['Notifications'],
        summary: 'Get unread notification count',
        responses: {
          200: {
            description: 'Unread count',
            content: {
              'application/json': {
                example: { success: true, message: 'Success', data: { count: 5 } },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/read-all': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark all notifications as read',
        responses: {
          200: { description: 'All notifications marked as read' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Notifications'],
        summary: 'Delete all already-read notifications',
        responses: {
          200: { description: 'Read notifications deleted', content: { 'application/json': { example: { success: true, message: '5 notification(s) deleted', data: { deleted: 5 } } } } },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/notifications/{id}/read': {
      patch: {
        tags: ['Notifications'],
        summary: 'Mark a single notification as read',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Notification marked as read' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/notifications/{id}': {
      delete: {
        tags: ['Notifications'],
        summary: 'Delete a single notification',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Notification deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  SAVED PLACES
    // ════════════════════════════════════════════════════════════════════════
    '/saved-places': {
      post: {
        tags: ['Saved Places'],
        summary: 'Create a saved place',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'latitude', 'longitude'],
                properties: {
                  name: { type: 'string', example: 'Home' },
                  address: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  icon: { type: 'string', example: '🏠' },
                  color: { type: 'string', example: '#22c55e' },
                  type: { type: 'string', enum: ['HOME', 'WORK', 'SCHOOL', 'GYM', 'OTHER'] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Saved place created',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { $ref: '#/components/schemas/SavedPlace' } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
      get: {
        tags: ['Saved Places'],
        summary: 'Get all my saved places',
        responses: {
          200: {
            description: 'List of saved places',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { $ref: '#/components/schemas/SuccessResponse' },
                    { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/SavedPlace' } } } },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/saved-places/{id}': {
      get: {
        tags: ['Saved Places'],
        summary: 'Get a saved place by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Saved place data' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      patch: {
        tags: ['Saved Places'],
        summary: 'Update a saved place',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  address: { type: 'string' },
                  latitude: { type: 'number' },
                  longitude: { type: 'number' },
                  icon: { type: 'string' },
                  color: { type: 'string' },
                  type: { type: 'string', enum: ['HOME', 'WORK', 'SCHOOL', 'GYM', 'OTHER'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Saved place updated' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
      delete: {
        tags: ['Saved Places'],
        summary: 'Delete a saved place',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Saved place deleted' },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  SMS
    // ════════════════════════════════════════════════════════════════════════
    '/sms/send': {
      post: {
        tags: ['SMS'],
        summary: 'Send an SMS to a phone number',
        description: 'Sends an arbitrary SMS via Twilio. Rate-limited to 20 requests per 15 minutes.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['to', 'message'],
                properties: {
                  to: { type: 'string', description: 'E.164 format phone number', example: '+8801712345678' },
                  message: { type: 'string', maxLength: 1600, example: 'Hello from LocaLink!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'SMS sent',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'SMS sent successfully',
                  data: { sid: 'SM...', to: '+8801712345678', status: 'queued' },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/sms/otp': {
      post: {
        tags: ['SMS'],
        summary: 'Send a 6-digit OTP to a phone number',
        description:
          'Generates a random 6-digit OTP, sends it via Twilio, and returns the OTP in the ' +
          'response body **only in non-production environments**.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['to'],
                properties: {
                  to: { type: 'string', description: 'E.164 format phone number', example: '+8801712345678' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'OTP sent',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'OTP sent successfully',
                  data: { sid: 'SM...', to: '+8801712345678', status: 'queued', otp: '482910' },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/BadRequest' },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },

    // ════════════════════════════════════════════════════════════════════════
    //  UPLOAD
    // ════════════════════════════════════════════════════════════════════════
    '/upload/single': {
      post: {
        tags: ['Upload'],
        summary: 'Upload a single file (image or PDF)',
        description: 'Max 5 MB. Stores to `public/uploads/`. Returns the public URL.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'File uploaded',
            content: {
              'application/json': {
                example: { success: true, message: 'File uploaded successfully', data: { url: '/uploads/file-1234567890-123456789.jpg' } },
              },
            },
          },
          400: { description: 'Invalid file type or size exceeded' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/upload/multiple': {
      post: {
        tags: ['Upload'],
        summary: 'Upload multiple files (max 10)',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['files'],
                properties: {
                  files: { type: 'array', items: { type: 'string', format: 'binary' }, maxItems: 10 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Files uploaded',
            content: {
              'application/json': {
                example: { success: true, message: 'Files uploaded successfully', data: { urls: ['/uploads/file-1.jpg', '/uploads/file-2.jpg'] } },
              },
            },
          },
          400: { description: 'Invalid file type or size exceeded' },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
  },
};

export default swaggerSpec;
