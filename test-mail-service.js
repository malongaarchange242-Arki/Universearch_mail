#!/usr/bin/env node

/**
 * 📧 MAIL SERVICE - Test & Integration Script
 * 
 * Utilisez ce script pour tester le mail-service
 * 
 * Usage:
 *   node test-mail-service.js [command]
 * 
 * Commands:
 *   health              - Vérifier la santé du service
 *   single-candidate    - Envoyer un email pour un candidat
 *   multiple-candidates - Envoyer des emails pour plusieurs candidats
 *   all                 - Tous les tests
 */

const http = require('http');

const config = {
    host: 'universearch-mail.onrender.com',
    port: 443,
    baseUrl: 'https://universearch-mail.onrender.com'
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

async function testHealth() {
    log('\n🧪 TEST 1: Health Check', 'cyan');
    log('═══════════════════════════', 'cyan');

    try {
        const response = await makeRequest('GET', '/health');
        if (response.status === 200) {
            log('✅ Service is running!', 'green');
            log(`   Status: ${response.body.status}`, 'green');
            log(`   Time: ${response.body.time}`, 'green');
            return true;
        } else {
            log(`❌ Unexpected status: ${response.status}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Cannot connect to service: ${error.message}`, 'red');
        log(`   Make sure the service is running on ${config.baseUrl}`, 'red');
        return false;
    }
}

async function testSingleCandidate() {
    log('\n🧪 TEST 2: Send Email - Single Candidate', 'cyan');
    log('════════════════════════════════════════', 'cyan');

    const payload = {
        candidate: {
            user_id: 'user_test_001',
            profile_id: 'profile_test_001',
            session_id: 'session_test_001',
            first_name: 'Jean',
            last_name: 'Dupont',
            full_name: 'Jean Dupont',
            email: 'jean.dupont@example.com',
            telephone: '+33612345678',
            user_type: 'etudiant',
            reason: 'Matched fields: Informatique, Génie Civil, Réseaux'
        },
        institutions: [
            {
                target_id: 'univ_psl',
                target_name: 'Université PSL Paris',
                target_type: 'universite',
                score: 0.95,
                rank: 1,
                confidence: 0.92
            }
        ],
        custom_message: 'Candidat très prometteur pour votre programme Informatique.',
        requested_by: {
            admin_email: 'admin@universearch.com',
            admin_name: 'Admin Universearch'
        }
    };

    log('\n📤 Sending request...', 'blue');
    log(`   Candidate: ${payload.candidate.full_name}`, 'blue');
    log(`   Institutions: ${payload.institutions.length}`, 'blue');

    try {
        const response = await makeRequest('POST', '/api/mail/recommendations/send', payload);
        
        log(`\n📊 Response Status: ${response.status}`, 'blue');

        if (response.status === 200) {
            log('\n✅ Email sent successfully!', 'green');
            log(`   Summary:`, 'green');
            log(`   - Sent: ${response.body.summary.sent}`, 'green');
            log(`   - Skipped: ${response.body.summary.skipped}`, 'green');
            log(`   - Failed: ${response.body.summary.failed}`, 'green');
            log(`   - File: ${response.body.attachment_file_name}`, 'green');
            
            if (response.body.results) {
                log(`\n   Delivery Report:`, 'green');
                response.body.results.forEach(result => {
                    const icon = result.status === 'sent' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
                    log(`   ${icon} ${result.target_name} (${result.target_type}): ${result.message}`, 'green');
                });
            }
            return true;
        } else {
            log(`\n❌ Error: ${response.body.error || 'Unknown error'}`, 'red');
            if (response.body.details) {
                log(`   Details: ${JSON.stringify(response.body.details)}`, 'red');
            }
            return false;
        }
    } catch (error) {
        log(`❌ Request failed: ${error.message}`, 'red');
        return false;
    }
}

async function testMultipleCandidates() {
    log('\n🧪 TEST 3: Send Emails - Multiple Candidates (Bulk)', 'cyan');
    log('════════════════════════════════════════════════════', 'cyan');

    const candidates = [
        {
            user_id: 'user_test_002',
            first_name: 'Marie',
            last_name: 'Martin',
            full_name: 'Marie Martin',
            email: 'marie.martin@example.com',
            telephone: '+33687654321',
            user_type: 'etudiant',
            reason: 'Matched fields: Biologie, Chimie'
        },
        {
            user_id: 'user_test_003',
            first_name: 'Pierre',
            last_name: 'Bernard',
            full_name: 'Pierre Bernard',
            email: 'pierre.bernard@example.com',
            telephone: '+33612341234',
            user_type: 'bachelier',
            reason: 'Matched fields: Mathématiques, Physique'
        }
    ];

    let allSuccess = true;

    for (const candidate of candidates) {
        log(`\n📧 Processing: ${candidate.full_name}`, 'yellow');

        const payload = {
            candidate: {
                ...candidate,
                profile_id: null,
                session_id: `session_${candidate.user_id}`,
                user_id: candidate.user_id
            },
            institutions: [
                {
                    target_id: 'univ_lyon2',
                    target_name: 'Université Lyon 2',
                    target_type: 'universite',
                    score: 0.88,
                    rank: 5,
                    confidence: 0.85
                },
                {
                    target_id: 'centre_idf',
                    target_name: 'Centre Formation Île-de-France',
                    target_type: 'centre',
                    score: 0.82,
                    rank: 8,
                    confidence: 0.80
                }
            ],
            custom_message: null
        };

        try {
            const response = await makeRequest('POST', '/api/mail/recommendations/send', payload);
            
            if (response.status === 200) {
                log(`✅ Success (${response.body.summary.sent} sent)`, 'green');
            } else {
                log(`❌ Failed: ${response.body.error}`, 'red');
                allSuccess = false;
            }
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'red');
            allSuccess = false;
        }
    }

    return allSuccess;
}

async function runAllTests() {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║   📧 MAIL SERVICE - INTEGRATION TESTS    ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    const healthOk = await testHealth();
    if (!healthOk) {
        log('\n⚠️  Service not responding. Stopping tests.', 'yellow');
        process.exit(1);
    }

    const singleOk = await testSingleCandidate();
    const multipleOk = await testMultipleCandidates();

    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║          📊 TEST SUMMARY                 ║', 'cyan');
    log('╚════════════════════════════════════════════╝', 'cyan');

    log(`\n✅ Health Check: PASS`, 'green');
    log(`${singleOk ? '✅' : '❌'} Single Candidate: ${singleOk ? 'PASS' : 'FAIL'}`, singleOk ? 'green' : 'red');
    log(`${multipleOk ? '✅' : '❌'} Multiple Candidates: ${multipleOk ? 'PASS' : 'FAIL'}`, multipleOk ? 'green' : 'red');

    const allPassed = healthOk && singleOk && multipleOk;
    log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`, allPassed ? 'green' : 'red');

    process.exit(allPassed ? 0 : 1);
}

// Main
const command = process.argv[2] || 'all';

switch (command) {
    case 'health':
        testHealth().then(ok => process.exit(ok ? 0 : 1));
        break;
    case 'single-candidate':
        testSingleCandidate().then(ok => process.exit(ok ? 0 : 1));
        break;
    case 'multiple-candidates':
        testMultipleCandidates().then(ok => process.exit(ok ? 0 : 1));
        break;
    case 'all':
    default:
        runAllTests();
        break;
}
