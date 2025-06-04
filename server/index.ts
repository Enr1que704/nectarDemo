import express from 'express'
import { PrismaClient } from '@prisma/client';
import path from 'path'
import { z } from 'zod'

const prisma = new PrismaClient();
const app = express()

const userSchema = z.object({
    first_name: z.string().min(1, "First name is required").max(50, "First name is too long"),
    last_name: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
    email: z.string().email("Invalid email format"),
    username: z.string().min(0, "Username must be at least 0 characters").max(30, "Username is too long").optional().nullable(),
    active: z.boolean(),
    country: z.string().min(2, "Country code is required").max(2, "Country code must be 2 characters")
});

const stateSchema = z.object({
    state: z.string()
        .min(2, "State code must be at least 2 characters")
        .max(2, "State code must be 2 characters")
        .regex(/^[A-Z]{2}$/, "State code must be 2 uppercase letters")
});

const zoneIdsSchema = z.object({
    zoneIds: z.string()
        .min(1, "At least one zone ID is required")
        .regex(/^[A-Z]{2}[CZ]\d{3}(,[A-Z]{2}[CZ]\d{3})*$/, "Invalid zone ID format. Expected format: XXC000,XXC001")
});

const validateUser = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    try {
        const validatedData = userSchema.parse(req.body);
        req.body = validatedData; 
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: "Validation failed",
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};

const validateQuery = (schema: z.ZodSchema) => (req: express.Request, res: express.Response, next: express.NextFunction): void => {
    try {
        const validatedData = schema.parse(req.query);
        req.query = validatedData;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({
                error: "Validation failed",
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
            });
            return;
        }
        res.status(500).json({ error: "Internal server error" });
        return;
    }
};

app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const ip = req.ip || req.socket.remoteAddress;
    console.log(`[${timestamp}] ${method} ${ip} ${req.url}`);
    next();
})

app.use(express.json())

app.post('/api/users', validateUser, async (req, res, _) => {
    try {
        const {first_name, email, last_name, active, country, username} = req.body
        const newUser = await prisma.user.create({
            data: {
                first_name,
                email,
                last_name,
                username,
                active,
                country
            },
        });
        res.status(201).json(newUser)
    } catch (error: any) {
        res.status(500).json({ error: "Failed to create user" });
        return;
    }
})

app.get('/api/user/country', async (req, res, _) => {
    const {country} = req.query;
    const users = await prisma.user.findMany({
        where: {
            country: country as string
        }
    })
    res.status(200).json(users)
})

app.get('/api/user/duplicate', async (req, res, _) => {
    const count = parseInt(req.query.count as string);
    const active = req.query.active === 'true' ? true : false;
    const whereClause = active ? { active: true } : {};              
    const duplicateUsers = await prisma.user.groupBy({
    by: ['first_name', 'last_name'],
    where: whereClause,
    _count: {
        first_name: true,
    },
    // This is the original query, but when it was summing the groups, it would only include the lower case version if that group was above the count threshold, but we want all the duplicates
    // having: {
    //     first_name: {
    //     _count: {
    //         gt: count,
    //     },
    //     },
    // }, 
    });

    console.log("duplicateUsers", duplicateUsers)
    let duplicateMap = new Map<string, number>();
    for (const user of duplicateUsers) {
        let key = `${user.first_name.toLowerCase()} ${user.last_name.toLowerCase()}`;
        if (duplicateMap.has(key)) {
            duplicateMap.set(key, (duplicateMap.get(key) || 0) + user._count.first_name);
        } else {
            duplicateMap.set(key, user._count.first_name);
        }
    }
    
    const filteredDuplicates = Array.from(duplicateMap.entries())
        .filter(([_, total]) => total > count)
        .map(([name, count]) => {
            const words = name.split(' ');
            const capitalizedName = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return [capitalizedName, count];
        });
    res.status(200).json(filteredDuplicates);
})


app.get('/api/weather/stateZones', validateQuery(stateSchema), async (req, res, _) => {
    try {
        const {state} = req.query;
        const weather = await fetch(`https://api.weather.gov/zones/?area=${state}&type=forecast&include_geometry=false`);
        if (!weather.ok) {
            res.status(weather.status).json({ error: "Failed to fetch weather data" });
            return;
        }
        const weatherData = await weather.json();
        res.status(200).json(weatherData);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
})

app.get('/api/weather/zoneForecast', validateQuery(zoneIdsSchema), async (req, res, _) => {
    try {
        const {zoneIds} = req.query;
        const zoneIdArray = (zoneIds as string).split(',');
        const forecasts = await Promise.all(
            zoneIdArray.map(async (zoneId) => {
                const weather = await fetch(`https://api.weather.gov/zones/feature/${zoneId}/forecast`);
                if (!weather.ok) {
                    throw new Error(`Failed to fetch forecast for zone ${zoneId}`);
                }
                return weather.json();
            })
        );
        for (const [index, forecast] of forecasts.entries()) {
            forecast.name = zoneIdArray[index];
        }
        res.status(200).json(forecasts);
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ error: "Failed to fetch weather forecasts" });
    }
})

app.get('/api/health', (_, res, __) => {
    res.sendStatus(200);
})

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// For Single Page Application (SPA) routing
app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const server = app.listen(3001)

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', {
        message: err.message,
        stack: err.stack,
    })
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(1) // Exit the process with a failure code
    })

    // If server.close() doesn't work for some reason, exit immediately
    setTimeout(() => {
        console.log('Forcing process exit');
        void prisma.$disconnect();
        process.exit(1);
    }, 5000); // Force exit after 5 seconds in case server doesn't close
})

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(1) // Exit the process with a failure code
    })

    // If server.close() doesn't work for some reason, exit immediately
    setTimeout(() => {
        console.log('Forcing process exit');
        void prisma.$disconnect();
        process.exit(1);
    }, 5000); // Force exit after 5 seconds in case server doesn't close
})

process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Cleaning up...');
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(0);
    })
})

process.on('SIGINT', () => {
    console.log('Received SIGINT. Cleaning up...');
    server.close(() => {
        console.log('Server Closed')
        void prisma.$disconnect();
        process.exit(0);
    })
})