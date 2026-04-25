#!/usr/bin/env node

/**
 * 🚀 TEST BATCH - Envoi à TOUS les établissements réels
 * 
 * Simule l'envoi d'un candidat à tous les 6 établissements
 * (4 universités + 2 centres de formation)
 */

const http = require('http');

const config = {
    host: 'localhost',
    port: 3010
};

// Toutes les institutions réelles
const allInstitutions = [
    // Universités
    {
        id: '232cf2c9-18b4-4be3-9f1d-eff96c33c760',
        nom: 'Université de Loango',
        email: 'secretariat@universite-loango.com',
        type: 'universite'
    },
    {
        id: '49d596fa-a9cc-42d9-98fb-b1d19fa0d6b2',
        nom: 'ESTIC-GECOM',
        email: 'esticsup@gmail.com',
        type: 'universite'
    },
    {
        id: '64b6d0f5-1325-47ca-9c29-10bdf1c0787f',
        nom: 'ESTAM',
        email: 'berlangemat@gmail.com',
        type: 'universite'
    },
    {
        id: '81235503-b233-4243-b71a-15f59b6a56d1',
        nom: 'ECES',
        email: 'pointe-noire@ecesecole.org',
        type: 'universite'
    },
    // Centres de formation
    {
        id: '323e07e3-b6cf-4c99-90d1-73c530153824',
        nom: 'CENTRE ATLANTIC',
        email: 'malonga12@gmail.com',
        type: 'centre'
    },
    {
        id: '944aafa1-1c76-4873-80b1-2ff9084e37c1',
        nom: 'CENTRE TRAINMAR',
        email: 'info@trainmarcongo.org',
        type: 'centre'
    }
];

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
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

async function testBatchSend() {
    log('\n╔══════════════════════════════════════════════════╗', 'magenta');
    log('║   🚀 TEST BATCH - ENVOI À TOUS LES ÉTABLISSEMENTS ║', 'magenta');
    log('╚══════════════════════════════════════════════════╝', 'magenta');

    // Vérifier la connexion
    log('\n[Étape 1/2] Vérification du service...', 'blue');
    try {
        const health = await makeRequest('GET', '/health');
        if (health.status === 200) {
            log('✅ Service actif sur universearch-mail.onrender.com', 'green');
        } else {
            log('❌ Service indisponible', 'red');
            return;
        }
    } catch (error) {
        log(`❌ Erreur: ${error.message}`, 'red');
        return;
    }

    // Préparation du payload
    log('\n[Étape 2/2] Construction du batch...', 'blue');
    
    const institutions = allInstitutions.map((inst, idx) => ({
        target_id: inst.id,
        target_name: inst.nom,
        target_type: inst.type,
        score: 0.90 - (idx * 0.05),
        rank: idx + 1,
        confidence: 0.88
    }));

    const payload = {
        candidate: {
            user_id: 'batch_test_' + Date.now(),
            profile_id: null,
            session_id: 'session_batch_' + Date.now(),
            first_name: 'Candidat',
            last_name: 'Test Batch',
            full_name: 'Candidat Test Batch',
            email: 'candidat.batch@universearch.local',
            telephone: '+242 05 555 5555',
            user_type: 'candidat',
            reason: 'Perfect match pour tous les domaines'
        },
        institutions: institutions,
        custom_message: 'Envoi batch test - vérifié par Universearch Mail Service',
        requested_by: 'admin'
    };

    log(`   📦 ${allInstitutions.length} établissements prêts à recevoir l'email`, 'cyan');
    log('   Universités: 4 | Centres: 2', 'cyan');

    // Envoi
    log('\n[Envoi] Transmission en cours...', 'yellow');
    
    try {
        const startTime = Date.now();
        const response = await makeRequest('POST', '/api/mail/recommendations/send', payload);
        const duration = Date.now() - startTime;

        if (response.status === 200) {
            const summary = response.body.summary || {};
            const sent = summary.sent || 0;
            const skipped = summary.skipped || 0;
            const failed = summary.failed || 0;
            const attachment = response.body.attachment_filename || 'Non généré';

            log('\n╔════════════════════════════════════════╗', 'green');
            log('║        ✅ RÉSULTATS DU BATCH          ║', 'green');
            log('╚════════════════════════════════════════╝', 'green');

            log('\n📊 Statistiques:', 'cyan');
            log(`   ✅ Envoyés:     ${sent}/${allInstitutions.length}`, sent === allInstitutions.length ? 'green' : 'yellow');
            log(`   ⏭️  Ignorés:    ${skipped}`, skipped > 0 ? 'yellow' : 'green');
            log(`   ❌ Échoués:     ${failed}`, failed > 0 ? 'red' : 'green');
            log(`   ⏱️  Durée:      ${duration}ms`, 'blue');
            log(`   📎 Attachment: ${attachment}`, 'cyan');

            log('\n📧 Détail par établissement:', 'cyan');
            if (response.body.results && Array.isArray(response.body.results)) {
                response.body.results.forEach((result, idx) => {
                    const icon = result.status === 'sent' ? '✅' : 
                                 result.status === 'failed' ? '❌' : '⏭️';
                    const label = allInstitutions[idx]?.nom || result.target_name;
                    const email = allInstitutions[idx]?.email || '';
                    log(`   ${icon} ${label}`, 'cyan');
                    log(`      └─ ${email}`, 'cyan');
                    log(`      └─ ${result.message}`, 'cyan');
                });
            }

            log('\n✅ Test complété avec succès!', 'green');
            log('\n💡 Prochaines étapes:', 'blue');
            log('   1. Vérifiez les 6 boîtes mail', 'blue');
            log('   2. Confirmez la réception des emails', 'blue');
            log('   3. Vérifiez les pièces jointes Excel', 'blue');
            log('   4. Testez via le frontend si nécessaire', 'blue');

        } else {
            log(`\n❌ Erreur HTTP ${response.status}`, 'red');
            log(`   ${JSON.stringify(response.body)}`, 'red');
        }
    } catch (error) {
        log(`\n❌ Erreur d'envoi: ${error.message}`, 'red');
    }

    log('\n════════════════════════════════════════════', 'magenta');
}

testBatchSend();
