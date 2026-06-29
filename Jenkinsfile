pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'lewan1311/tasklist-frontend'
        DOCKER_TAG   = "${BUILD_NUMBER}"
        IMAGE_REF    = "${DOCKER_IMAGE}:${DOCKER_TAG}"
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('1. Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('2. Unit tests & Coverage') {
            steps {
                sh 'npm run test -- --coverage || npm run test:coverage || true'
            }
        }

        stage('3. SonarQube analysis') {
            steps {
                withSonarQubeEnv(credentialsId: 'lewan1311-sonar-token', installationName: 'SonarQube') {
                    sh 'npx sonarqube-scanner'
                }
            }
        }

        stage('4. Build Docker image') {
            steps {
                sh """
                    docker build \
                        -t ${IMAGE_REF} \
                        -t ${DOCKER_IMAGE}:latest \
                        .
                """
            }
        }

        stage('5. Trivy scan + reports') {
            steps {
                sh """
                    mkdir -p reports
                    trivy image --no-progress --format table --output reports/trivy-report.txt ${IMAGE_REF}
                    trivy image --no-progress --format json --output reports/trivy-report.json ${IMAGE_REF}
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/trivy-report.*', allowEmptyArchive: true
                }
            }
        }

        stage('6. Trivy security gate') {
            steps {
                sh """
                    trivy image --no-progress --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_REF}
                """
            }
        }

        stage('7. Generate SBOM') {
            steps {
                sh """
                    mkdir -p reports
                    trivy image --no-progress --format cyclonedx --output reports/sbom.cdx.json ${IMAGE_REF}
                """
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/sbom.cdx.json', allowEmptyArchive: true
                }
            }
        }

        stage('8. Push Docker image') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'lewan1311-dockerhub-password',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        docker login -u "$DOCKER_USER" -p "$DOCKER_PASS"
                        docker push "$IMAGE_REF"
                        docker push "$DOCKER_IMAGE:latest"
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}