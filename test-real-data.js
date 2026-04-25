#!/usr/bin/env node

/**
 * 📧 MAIL SERVICE - Test avec Vraies Données
 * 
 * Test l'envoi d'emails avec les vrais IDs et emails de la base de données
 */

const http = require('http');

const config = {
    host: 'localhost',
    port: 3010,
    baseUrl: 'http://localhost:3010'
};

// Vraies données de la base de données
const realData = {
    universites: [
        {
            id: '232cf2c9-18b4-4be3-9f1d-eff96c33c760',
            nom: 'Université de Loango',
            email: 'secretariat@universite-loango.com'
        },
        {
            id: '49d596fa-a9cc-42d9-98fb-b1d19fa0d6b2',
            nom: 'ESTIC-GECOM',
            email: 'esticsup@gmail.com'
        },
        {
            id: '64b6d0f5-1325-47ca-9c29-10bdf1c0787f',
            nom: 'ESTAM',
            email: 'berlangemat@gmail.com'
        },
        {
            id: '81235503-b233-4243-b71a-15f59b6a56d1',
            nom: 'ECES',
            email: 'pointe-noire@ecesecole.org'
        }
    ],
    centres: [
        {
            id: '323e07e3-b6cf-4c99-90d1-73c530153824',
            nom: 'CENTRE ATLANTIC',
            email: 'malonga12@gmail.com'
        },
        {
            id: '944aafa1-1c76-4873-80b1-2ff9084e37c1',
            nom: 'CENTRE TRAINMAR',
            email: 'info@trainmarcongo.org'
        }
    ]
};

// Colors
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: config.host,
            port: config.port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function testWithRealData() {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║   📧 TEST AVEC VRAIES DONNÉES SUPABASE   ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    // Test 1: Health Check
    log('\n[1/3] Vérification de la santé du service...', 'blue');
    try {
        const health = await makeRequest('GET', '/health');
        if (health.status === 200) {
            log('✅ Service actif', 'green');
        } else {
            log('❌ Service indisponible', 'red');
            return;
        }
    } catch (error) {
        log(`❌ Erreur de connexion: ${error.message}`, 'red');
        return;
    }

    // Test 2: Envoyer à une université
    log('\n[2/3] Test d\'envoi à une université...', 'blue');
    const universiteTest = realData.universites[0];
    
    const payload1 = {
        candidate: {
            user_id: 'test_user_001',
            profile_id: null,
            session_id: 'session_001',
            first_name: 'Jean',
            last_name: 'Dupont',
            full_name: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            telephone: '+242 05 621 96 87',
            user_type: 'etudiant',
            reason: 'Matched fields: Informatique, Génie Civil'
        },
        institutions: [
            {
                target_id: universiteTest.id,
                target_name: universiteTest.nom,
                target_type: 'universite',
                score: 0.95,
                rank: 1,
                confidence: 0.92
            }
        ],
        custom_message: 'Candidat très prometteur pour vos programmes.'
    };

    try {
        log(`   Envoi à: ${universiteTest.nom}`, 'blue');
        log(`   Email: ${universiteTest.email}`, 'blue');
        
        const response1 = await makeRequest('POST', '/api/mail/recommendations/send', payload1);
        
        if (response1.status === 200) {
            const sent = response1.body.summary?.sent || 0;
            const skipped = response1.body.summary?.skipped || 0;
            const failed = response1.body.summary?.failed || 0;
            
            log(`   ✅ Réponse reçue`, 'green');
            log(`      - Envoyés: ${sent}`, sent > 0 ? 'green' : 'yellow');
            log(`      - Ignorés: ${skipped}`, 'yellow');
            log(`      - Échoués: ${failed}`, failed > 0 ? 'red' : 'green');
            
            if (response1.body.results) {
                response1.body.results.forEach(result => {
                    const icon = result.status === 'sent' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
                    log(`      ${icon} ${result.target_name}: ${result.message}`, 'cyan');
                });
            }
        }
    } catch (error) {
        log(`   ❌ Erreur: ${error.message}`, 'red');
    }

    // Test 3: Envoyer à un centre de formation
    log('\n[3/3] Test d\'envoi à un centre de formation...', 'blue');
    const centreTest = realData.centres[0];
    
    const payload2 = {
        candidate: {
            user_id: 'test_user_002',
            profile_id: null,
            session_id: 'session_002',
            first_name: 'Marie',
            last_name: 'Martin',
            full_name: 'Marie Martin',
            email: 'marie.martin@example.com',
            telephone: '+242 06 831 93 93',
            user_type: 'bachelier',
            reason: 'Matched fields: Logistique, Transport'
        },
        institutions: [
            {
                target_id: centreTest.id,
                target_name: centreTest.nom,
                target_type: 'centre',
                score: 0.88,
                rank: 2,
                confidence: 0.85
            }
        ],
        custom_message: 'Candidate excellente pour vos formations en logistique.'
    };

    try {
        log(`   Envoi à: ${centreTest.nom}`, 'blue');
        log(`   Email: ${centreTest.email}`, 'blue');
        
        const response2 = await makeRequest('POST', '/api/mail/recommendations/send', payload2);
        
        if (response2.status === 200) {
            const sent = response2.body.summary?.sent || 0;
            const skipped = response2.body.summary?.skipped || 0;
            const failed = response2.body.summary?.failed || 0;
            
            log(`   ✅ Réponse reçue`, 'green');
            log(`      - Envoyés: ${sent}`, sent > 0 ? 'green' : 'yellow');
            log(`      - Ignorés: ${skipped}`, 'yellow');
            log(`      - Échoués: ${failed}`, failed > 0 ? 'red' : 'green');
            
            if (response2.body.results) {
                response2.body.results.forEach(result => {
                    const icon = result.status === 'sent' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
                    log(`      ${icon} ${result.target_name}: ${result.message}`, 'cyan');
                });
            }
        }
    } catch (error) {
        log(`   ❌ Erreur: ${error.message}`, 'red');
    }

    // Résumé
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║          ✅ TEST TERMINÉ                 ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');
    
    log('\n📊 Données disponibles dans Supabase:', 'yellow');
    log(`   • ${realData.universites.length} universités`, 'yellow');
    log(`   • ${realData.centres.length} centres de formation`, 'yellow');
    
    log('\n💡 Prochaines étapes:', 'blue');
    log('   1. Allez à recommended_candidates.html', 'blue');
    log('   2. Sélectionnez un candidat', 'blue');
    log('   3. Cliquez "Envoyer Email"', 'blue');
    log('   4. Sélectionnez les établissements', 'blue');
    log('   5. Cliquez "Envoyer les emails"', 'blue');
    log('   6. Vérifiez les emails reçus!', 'blue');
}

testWithRealData();
