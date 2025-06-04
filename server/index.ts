import express from 'express'
import { PrismaClient } from '@prisma/client';
import path from 'path'

const prisma = new PrismaClient();
const app = express()

app.use((req, _res, next) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const ip = req.ip || req.socket.remoteAddress;
    console.log(`[${timestamp}] ${method} ${ip} ${req.url}`);
    next();
})

app.use(express.json())

app.post('/api/users', async (req, res, _) => {
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


app.get('/api/weather/stateZones', async (req, res, _) => {
    const {state} = req.query;
    const weather = await fetch(`https://api.weather.gov/zones/?area=${state}&type=forecast&include_geometry=false`)
    const weatherData = await weather.json()
    res.status(200).json(weatherData)
})

app.get('/api/weather/zoneForecast', async (req, res, _) => {
    const {zoneIds} = req.query;
    if (!zoneIds || typeof zoneIds !== 'string') {
        res.status(400).json({ error: 'zoneIds parameter is required and must be a string' });
        return;
    }
    const zoneIdArray = zoneIds.split(',');
    const forecasts = await Promise.all(
        zoneIdArray.map(async (zoneId) => {
            const weather = await fetch(`https://api.weather.gov/zones/feature/${zoneId}/forecast`);
            return weather.json();
        })
    );
    for (const [index, forecast] of forecasts.entries()) {
        forecast.name = zoneIdArray[index];
    }
    res.status(200).json(forecasts);
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