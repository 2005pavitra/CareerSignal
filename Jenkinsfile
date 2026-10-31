pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'CareerSignal source code retrieved!'
            }
        }

        stage('Environment Check') {
            steps {
                sh '''
                    echo "Current user:"
                    whoami

                    echo "Java version:"
                    java -version

                    echo "Git version:"
                    git --version
                '''
            }
        }

        stage('Project Inspection') {
            steps {
                sh '''
                    echo "Project structure:"
                    ls -la

                    echo "Backend:"
                    ls -la backend

                    echo "Frontend:"
                    ls -la frontend

                    echo "Docker Compose:"
                    ls -l docker-compose.yml
                '''
            }
        }
    }

    post {
        success {
            echo 'CareerSignal pipeline completed!'
        }

        failure {
            echo 'CareerSignal pipeline failed!'
        }
    }
}



// pipeline {
//     agent any

//     environment {
//         DOCKERHUB_NAMESPACE = 'pavitrapandey'
//     }

//     stages {
//         stage('Backend tests') {
//             steps {
//                 dir('backend') {
//                     sh 'npm ci'
//                     sh 'npm test'
//                 }
//             }
//         }

//         stage('Frontend checks') {
//             steps {
//                 dir('frontend') {
//                     sh 'npm ci'
//                     sh 'npm run lint'
//                     sh 'npm run build'
//                 }
//             }
//         }

//         stage('Build Docker images') {
//             steps {
//                 sh '''
//                     docker build \
//                         --tag "$DOCKERHUB_NAMESPACE/careersignal-backend:$BUILD_NUMBER" \
//                         ./backend
//                     docker build \
//                         --build-arg VITE_API_URL=http://localhost:4000 \
//                         --tag "$DOCKERHUB_NAMESPACE/careersignal-frontend:$BUILD_NUMBER" \
//                         ./frontend
//                 '''
//             }
//         }

//         stage('Publish Docker images') {
//             when {
//                 branch 'main'
//             }
//             steps {
//                 withCredentials([usernamePassword(
//                     credentialsId: 'dockerhub-credentials',
//                     usernameVariable: 'DOCKERHUB_USERNAME',
//                     passwordVariable: 'DOCKERHUB_PASSWORD'
//                 )]) {
//                     sh '''
//                         set +x
//                         echo "$DOCKERHUB_PASSWORD" | docker login \
//                             --username "$DOCKERHUB_USERNAME" \
//                             --password-stdin

//                         for image in careersignal-backend careersignal-frontend; do
//                             docker tag \
//                                 "$DOCKERHUB_NAMESPACE/$image:$BUILD_NUMBER" \
//                                 "$DOCKERHUB_NAMESPACE/$image:latest"
//                             docker push "$DOCKERHUB_NAMESPACE/$image:$BUILD_NUMBER"
//                             docker push "$DOCKERHUB_NAMESPACE/$image:latest"
//                         done

//                         docker logout
//                     '''
//                 }
//             }
//         }
//     }
// }