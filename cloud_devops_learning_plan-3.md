# Cloud-Ready Full-Stack DevOps Learning Plan (Enhanced Edition)

A complete, personalized, realistic learning plan that takes you from your current level to cloud-ready full-stack/backend/DevOps engineer in a structured way.

**This plan is designed for:**
- ✔ CS students with programming fundamentals
- ✔ Already knows Spring, Docker, MySQL, Git, CI/CD basics
- ✔ Wants to learn Kubernetes, Ingress, Cloud, DevOps
- ✔ Wants hands-on project-based learning

**Time commitment:** 4–12 weeks (10-15 hours per week)

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Basic Linux command line knowledge
- ✅ Understanding of HTTP/REST APIs
- ✅ Familiarity with YAML syntax
- ✅ Basic networking concepts (IP, ports, DNS)
- ✅ Git fundamentals (clone, commit, push, pull)
- ✅ A GitHub account
- ✅ DockerHub account (free)

---

## 🧭 THE COMPLETE LEARNING ROADMAP

### ⭐ PHASE 1 — Foundation Upgrade (1–2 weeks)

You already know Docker & Docker Compose, but we make it production-ready.

#### 🔸 Goals
- Learn multi-stage Dockerfiles for smaller images
- Optimize image size and build time
- Properly manage environment variables & secrets
- Understand container networking
- Implement security best practices

#### 🔸 Theory to Learn
- Docker best practices documentation
- Multi-stage builds concept
- Layer caching optimization
- Security: running as non-root user
- Image scanning basics

#### 🔸 Hands-on Exercises
1. **Convert your Spring Boot app into a multi-stage Docker build:**
   ```dockerfile
   # Build stage
   FROM maven:3.8-openjdk-17 AS build
   WORKDIR /app
   COPY pom.xml .
   COPY src ./src
   RUN mvn clean package -DskipTests
   
   # Runtime stage
   FROM openjdk:17-slim
   RUN addgroup --system spring && adduser --system spring --ingroup spring
   USER spring:spring
   COPY --from=build /app/target/*.jar app.jar
   EXPOSE 8080
   ENTRYPOINT ["java","-jar","/app.jar"]
   ```

2. **Split services in `docker-compose.yml`:**
   - app (Spring Boot)
   - mysql (with persistent volume)
   - nginx (reverse proxy - optional but recommended)

3. **Add `.env` management:**
   ```env
   MYSQL_ROOT_PASSWORD=secret
   MYSQL_DATABASE=equipmentdb
   MYSQL_USER=appuser
   MYSQL_PASSWORD=apppass
   ```

4. **Scan your image for vulnerabilities:**
   ```bash
   docker scan your-app:latest
   # or use Trivy
   trivy image your-app:latest
   ```

#### 🔸 Common Pitfalls to Avoid
- ❌ Running containers as root user
- ❌ Copying unnecessary files (use .dockerignore)
- ❌ Not using layer caching effectively
- ❌ Hardcoding secrets in Dockerfile

#### 📌 Result
A clean, secure, production-ready container setup with optimized build times.

#### 📚 Resources
- [Docker Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker security best practices](https://docs.docker.com/develop/security-best-practices/)
- [Dockerfile best practices](https://docs.docker.com/develop/dev-best-practices/)

---

### 🚀 PHASE 2 — Kubernetes Basics (2 weeks)

#### 🔸 Goals
Understand core Kubernetes concepts:
- Pod (smallest deployable unit)
- Deployment (manages ReplicaSets)
- ReplicaSet (ensures desired number of pods)
- Service (networking/load balancing)
- ConfigMap (configuration data)
- Secret (sensitive data)
- PersistentVolume / PersistentVolumeClaim (storage)
- Namespace (isolation)
- Resource requests & limits

#### 🔸 Theory to Learn
- Kubernetes architecture (control plane, nodes, etcd)
- Declarative vs imperative management
- Pod lifecycle and restart policies
- Service types: ClusterIP, NodePort, LoadBalancer
- Health checks: liveness and readiness probes

#### 🔸 Hands-on (CRITICAL)

**Setup:**
1. Install Minikube: `brew install minikube` (macOS) or follow [official guide](https://minikube.sigs.k8s.io/docs/start/)
2. Install kubectl: `brew install kubectl`
3. Start cluster: `minikube start`

**Deploy your application:**

1. **Create Deployment for Spring Boot:**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: equipment-app
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: equipment-app
     template:
       metadata:
         labels:
           app: equipment-app
       spec:
         containers:
         - name: app
           image: your-dockerhub/equipment-app:latest
           ports:
           - containerPort: 8080
           env:
           - name: SPRING_DATASOURCE_URL
             value: jdbc:mysql://mysql-service:3306/equipmentdb
           - name: SPRING_DATASOURCE_USERNAME
             valueFrom:
               secretKeyRef:
                 name: db-secret
                 key: username
           - name: SPRING_DATASOURCE_PASSWORD
             valueFrom:
               secretKeyRef:
                 name: db-secret
                 key: password
           resources:
             requests:
               memory: "256Mi"
               cpu: "250m"
             limits:
               memory: "512Mi"
               cpu: "500m"
           livenessProbe:
             httpGet:
               path: /actuator/health/liveness
               port: 8080
             initialDelaySeconds: 30
             periodSeconds: 10
           readinessProbe:
             httpGet:
               path: /actuator/health/readiness
               port: 8080
             initialDelaySeconds: 20
             periodSeconds: 5
   ```

2. **Create Service (ClusterIP):**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: equipment-service
   spec:
     selector:
       app: equipment-app
     ports:
     - port: 80
       targetPort: 8080
     type: ClusterIP
   ```

3. **Create Secret for database credentials:**
   ```bash
   kubectl create secret generic db-secret \
     --from-literal=username=appuser \
     --from-literal=password=apppass
   ```

4. **Create PersistentVolumeClaim for MySQL:**
   ```yaml
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: mysql-pvc
   spec:
     accessModes:
       - ReadWriteOnce
     resources:
       requests:
         storage: 1Gi
   ```

5. **Deploy MySQL:**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: mysql
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: mysql
     template:
       metadata:
         labels:
           app: mysql
       spec:
         containers:
         - name: mysql
           image: mysql:8.0
           env:
           - name: MYSQL_ROOT_PASSWORD
             valueFrom:
               secretKeyRef:
                 name: db-secret
                 key: password
           - name: MYSQL_DATABASE
             value: equipmentdb
           ports:
           - containerPort: 3306
           volumeMounts:
           - name: mysql-storage
             mountPath: /var/lib/mysql
         volumes:
         - name: mysql-storage
           persistentVolumeClaim:
             claimName: mysql-pvc
   ```

6. **Create MySQL Service:**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: mysql-service
   spec:
     selector:
       app: mysql
     ports:
     - port: 3306
       targetPort: 3306
     type: ClusterIP
   ```

#### 🔸 Essential kubectl Commands

Learn these debugging commands:
```bash
# View all resources
kubectl get all

# Check pod status in detail
kubectl get pods -o wide

# View pod logs
kubectl logs <pod-name>
kubectl logs <pod-name> -f  # follow logs

# Describe a pod (shows events and errors)
kubectl describe pod <pod-name>

# Execute commands inside a pod
kubectl exec -it <pod-name> -- /bin/bash

# Check resource usage
kubectl top pods
kubectl top nodes

# Port forward for local testing
kubectl port-forward pod/<pod-name> 8080:8080

# Apply configuration
kubectl apply -f deployment.yaml

# Delete resources
kubectl delete -f deployment.yaml
kubectl delete pod <pod-name>
```

#### 🔸 Troubleshooting Exercises

**Challenge yourself:**
1. Intentionally use wrong image name → debug with `kubectl describe pod`
2. Set wrong environment variable → check logs with `kubectl logs`
3. Remove readiness probe → observe traffic sent to unready pods
4. Set memory limit too low → observe OOMKilled status

#### 📌 Result
Your app runs inside Kubernetes, fully containerized, with proper health checks, resource limits, and database connectivity via Service DNS.

#### 📚 Resources
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Kubernetes Basics Tutorial](https://kubernetes.io/docs/tutorials/kubernetes-basics/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

---

### 🌐 PHASE 3 — Ingress + NGINX Ingress Controller (1 week)

#### 🔸 Goals
Understand:
- What Ingress is (routing rules)
- What Ingress Controller is (implementation - NGINX)
- TLS termination at the edge
- Path-based routing (`/api`, `/admin`)
- Host-based routing (`api.example.com`, `admin.example.com`)
- Network policies for security

#### 🔸 Theory to Learn
- OSI Layer 7 (Application Layer) routing
- TLS/SSL certificates and HTTPS
- Load balancing algorithms
- Difference between Ingress and Service

#### 🔸 Hands-on

1. **Install NGINX Ingress Controller in Minikube:**
   ```bash
   minikube addons enable ingress
   
   # Verify installation
   kubectl get pods -n ingress-nginx
   ```

2. **Create Ingress rule:**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: equipment-ingress
     annotations:
       nginx.ingress.kubernetes.io/rewrite-target: /
   spec:
     ingressClassName: nginx
     rules:
     - host: equipment.local
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: equipment-service
               port:
                 number: 80
   ```

3. **Update /etc/hosts:**
   ```bash
   # Get Minikube IP
   minikube ip
   
   # Add to /etc/hosts
   192.168.49.2 equipment.local
   ```

4. **Test access:**
   ```bash
   curl http://equipment.local
   ```

5. **Add TLS with self-signed certificate:**
   ```bash
   # Generate self-signed cert
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout tls.key -out tls.crt \
     -subj "/CN=equipment.local"
   
   # Create secret
   kubectl create secret tls equipment-tls \
     --key tls.key --cert tls.crt
   ```

6. **Update Ingress with TLS:**
   ```yaml
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: equipment-ingress
   spec:
     ingressClassName: nginx
     tls:
     - hosts:
       - equipment.local
       secretName: equipment-tls
     rules:
     - host: equipment.local
       http:
         paths:
         - path: /
           pathType: Prefix
           backend:
             service:
               name: equipment-service
               port:
                 number: 80
   ```

7. **Test HTTPS:**
   ```bash
   curl -k https://equipment.local
   ```

#### 🔸 Advanced: Network Policies

Add network policy to restrict traffic:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-to-app
spec:
  podSelector:
    matchLabels:
      app: equipment-app
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
```

#### 📌 Result
You now understand the real-world entrypoint system used in EKS/GKE/AKS. Traffic flows: User → Load Balancer → Ingress Controller → Service → Pods.

#### 📚 Resources
- [NGINX Ingress Controller Docs](https://kubernetes.github.io/ingress-nginx/)
- [Kubernetes Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)

---

### 📦 PHASE 4 — Helm Charts (1 week)

#### 🔸 Goals
- Learn Helm (the Kubernetes package manager)
- Understand templating with Go templates
- Manage multiple environments (dev, staging, prod)
- Version control deployments
- Share reusable charts

#### 🔸 Theory to Learn
- Helm architecture (Chart, Release, Repository)
- Chart structure and best practices
- Values hierarchy and overrides
- Helm hooks for advanced deployment strategies

#### 🔸 Hands-on

1. **Install Helm:**
   ```bash
   brew install helm  # macOS
   # or follow https://helm.sh/docs/intro/install/
   ```

2. **Create Helm chart structure:**
   ```bash
   helm create equipment-manager
   ```

   This creates:
   ```
   equipment-manager/
   ├── Chart.yaml           # Metadata
   ├── values.yaml          # Default configuration
   ├── charts/              # Dependencies
   └── templates/
       ├── deployment.yaml
       ├── service.yaml
       ├── ingress.yaml
       ├── _helpers.tpl     # Template helpers
       └── NOTES.txt
   ```

3. **Edit `values.yaml`:**
   ```yaml
   replicaCount: 3
   
   image:
     repository: your-dockerhub/equipment-app
     tag: "latest"
     pullPolicy: IfNotPresent
   
   service:
     type: ClusterIP
     port: 80
     targetPort: 8080
   
   ingress:
     enabled: true
     className: nginx
     hosts:
       - host: equipment.local
         paths:
           - path: /
             pathType: Prefix
     tls:
       - secretName: equipment-tls
         hosts:
           - equipment.local
   
   resources:
     limits:
       cpu: 500m
       memory: 512Mi
     requests:
       cpu: 250m
       memory: 256Mi
   
   mysql:
     enabled: true
     auth:
       database: equipmentdb
       username: appuser
       password: apppass
     primary:
       persistence:
         enabled: true
         size: 1Gi
   ```

4. **Update `templates/deployment.yaml` to use values:**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: {{ include "equipment-manager.fullname" . }}
     labels:
       {{- include "equipment-manager.labels" . | nindent 4 }}
   spec:
     replicas: {{ .Values.replicaCount }}
     selector:
       matchLabels:
         {{- include "equipment-manager.selectorLabels" . | nindent 6 }}
     template:
       metadata:
         labels:
           {{- include "equipment-manager.selectorLabels" . | nindent 8 }}
       spec:
         containers:
         - name: {{ .Chart.Name }}
           image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
           imagePullPolicy: {{ .Values.image.pullPolicy }}
           ports:
           - containerPort: {{ .Values.service.targetPort }}
           resources:
             {{- toYaml .Values.resources | nindent 12 }}
   ```

5. **Install the chart:**
   ```bash
   helm install equipment-manager ./equipment-manager
   ```

6. **Check release:**
   ```bash
   helm list
   helm status equipment-manager
   ```

7. **Update configuration:**
   ```bash
   # Edit values.yaml, then:
   helm upgrade equipment-manager ./equipment-manager
   ```

8. **Create environment-specific values:**
   ```bash
   # values-dev.yaml
   replicaCount: 1
   
   # values-prod.yaml
   replicaCount: 5
   resources:
     limits:
       cpu: 1000m
       memory: 1Gi
   ```

   ```bash
   # Deploy to different environments
   helm install equipment-dev ./equipment-manager -f values-dev.yaml
   helm install equipment-prod ./equipment-manager -f values-prod.yaml
   ```

9. **Rollback if needed:**
   ```bash
   helm rollback equipment-manager 1
   ```

#### 🔸 Common Helm Commands
```bash
# List all releases
helm list

# Get release history
helm history equipment-manager

# Uninstall release
helm uninstall equipment-manager

# Dry run (test without installing)
helm install equipment-manager ./equipment-manager --dry-run --debug

# Template rendering (see final YAML)
helm template equipment-manager ./equipment-manager

# Lint chart
helm lint ./equipment-manager

# Package chart
helm package ./equipment-manager

# Search for charts
helm search repo mysql
```

#### 📌 Result
Your app is now deployable like real enterprise applications with version control, easy rollbacks, and environment management.

#### 📚 Resources
- [Helm Documentation](https://helm.sh/docs/)
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Artifact Hub](https://artifacthub.io/) - Find existing charts

---

### ☁️ PHASE 5 — Cloud Deployment (AWS EKS) (2–3 weeks)

#### 🔸 Goals
- Deploy production Kubernetes cluster in the cloud
- Use managed database service (RDS)
- Configure cloud load balancers
- Set up DNS and SSL certificates
- Understand cloud IAM and security
- **Manage costs effectively**

#### 🔸 Cloud Provider Choice

**Recommended: AWS EKS**
- Industry standard
- Best documentation
- Most job postings require AWS

**Alternative: GCP GKE**
- Cheaper for students ($300 free credit)
- Simpler to use
- Good learning platform

#### 🔸 Cost Awareness ⚠️

**Expected monthly costs:**
- EKS cluster: ~$73/month (control plane)
- EC2 instances: ~$30-60/month (2x t3.small)
- RDS MySQL: ~$15-30/month (db.t3.micro)
- **Total: ~$120-165/month**

**Cost-saving strategies:**
```bash
# Use spot instances (can save 70%)
# Delete cluster when not using it
eksctl delete cluster --name equipment-cluster

# Use AWS Free Tier (first 12 months):
# - 750 hours EC2 t2.micro
# - 750 hours RDS db.t2.micro
# - 5GB S3 storage
```

**Set up billing alerts:**
1. AWS Console → Billing → Budgets
2. Create budget: $50/month
3. Set alert at 80% ($40)

#### 🔸 Hands-on Setup

**Prerequisites:**
```bash
# Install AWS CLI
brew install awscli

# Configure credentials
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Format (json)

# Install eksctl
brew tap weaveworks/tap
brew install weaveworks/tap/eksctl

# Verify
eksctl version
```

**1. Create EKS Cluster:**

Create `cluster-config.yaml`:
```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: equipment-cluster
  region: us-east-1
  version: "1.28"

managedNodeGroups:
  - name: equipment-nodes
    instanceType: t3.small
    desiredCapacity: 2
    minSize: 1
    maxSize: 3
    volumeSize: 20
    ssh:
      allow: true
    labels:
      role: worker
    tags:
      Environment: production
```

```bash
# Create cluster (takes 15-20 minutes)
eksctl create cluster -f cluster-config.yaml

# Verify
kubectl get nodes
```

**2. Install NGINX Ingress Controller on EKS:**
```bash
# Add Helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Install with AWS Network Load Balancer
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer \
  --set controller.service.annotations."service\.beta\.kubernetes\.io/aws-load-balancer-type"="nlb"

# Get Load Balancer URL
kubectl get svc -n ingress-nginx
```

**3. Create RDS MySQL Database:**
```bash
# Via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier equipment-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.35 \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxx \
  --db-subnet-group-name your-subnet-group \
  --publicly-accessible

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier equipment-db \
  --query 'DBInstances[0].Endpoint.Address'
```

**4. Store Secrets in AWS Secrets Manager:**
```bash
# Install secrets-store-csi-driver
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/rbac-secretproviderclass.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/csidriver.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/secrets-store.csi.x-k8s.io_secretproviderclasses.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/secrets-store.csi.x-k8s.io_secretproviderclasspodstatuses.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes-sigs/secrets-store-csi-driver/main/deploy/secrets-store-csi-driver.yaml

# Install AWS provider
kubectl apply -f https://raw.githubusercontent.com/aws/secrets-store-csi-driver-provider-aws/main/deployment/aws-provider-installer.yaml

# Create secret in AWS Secrets Manager
aws secretsmanager create-secret \
  --name equipment/db-credentials \
  --secret-string '{"username":"admin","password":"YourSecurePassword123!"}'
```

**5. Update Spring Boot configuration:**

In `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:3306/equipmentdb
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  jpa:
    hibernate:
      ddl-auto: update
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
```

**6. Deploy with Helm:**
```bash
# Update values.yaml with RDS endpoint
helm upgrade --install equipment-manager ./equipment-manager \
  --set image.tag=v1.0.0 \
  --set env.DB_HOST=equipment-db.xxxxx.us-east-1.rds.amazonaws.com \
  --set env.DB_USERNAME=admin \
  --set env.DB_PASSWORD=YourSecurePassword123!
```

**7. Set up Domain with Route53:**
```bash
# Get Load Balancer DNS
export LB_DNS=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Create Route53 record (via console or CLI)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "equipment.yourdomain.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$LB_DNS'"}]
      }
    }]
  }'
```

**8. Add SSL with cert-manager:**
```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Update Ingress to use cert-manager
# Add annotation: cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

#### 🔸 Database Migration Strategy
```bash
# Export data from local MySQL
mysqldump -u root -p equipmentdb > backup.sql

# Import to RDS
mysql -h equipment-db.xxxxx.rds.amazonaws.com -u admin -p equipmentdb < backup.sql

# Or use Spring Boot Flyway/Liquibase for migrations
```

#### 🔸 Security Best Practices
1. **IAM Roles:** Use IRSA (IAM Roles for Service Accounts)
2. **Network Policies:** Restrict pod-to-pod communication
3. **Security Groups:** Limit RDS access to EKS worker nodes only
4. **Secrets:** Never commit secrets to Git
5. **RBAC:** Create limited service accounts

#### 📌 Result
You've deployed a full production architecture in the cloud with:
- Managed Kubernetes (EKS)
- Managed Database (RDS)
- Load Balancer + SSL
- DNS routing
- Secrets management

#### 🔸 Don't Forget to Clean Up!
```bash
# Delete cluster when done learning
eksctl delete cluster --name equipment-cluster

# Delete RDS
aws rds delete-db-instance \
  --db-instance-identifier equipment-db \
  --skip-final-snapshot

# Delete Route53 records
# Delete Load Balancers
```

#### 📚 Resources
- [AWS EKS Workshop](https://www.eksworkshop.com/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [eksctl Documentation](https://eksctl.io/)
- [AWS Cost Calculator](https://calculator.aws/)

---

### 🔧 PHASE 6 — CI/CD Pipeline to Kubernetes (1 week)

#### 🔸 Goals
- Automate the entire deployment pipeline
- Implement proper testing stages
- Use Docker layer caching
- Deploy to Kubernetes automatically
- Set up notifications

#### 🔸 Enhanced Pipeline Flow
```
Git Push → Webhook → Jenkins
   ↓
Run Unit Tests (JUnit)
   ↓
Build JAR (Maven)
   ↓
Run Integration Tests
   ↓
Build Docker Image
   ↓
Scan Image (Trivy)
   ↓
Push to DockerHub
   ↓
Update Helm Values
   ↓
Deploy to K8s (Helm)
   ↓
Run Smoke Tests
   ↓
Notify (Slack/Email)
```

#### 🔸 Hands-on: Complete Jenkinsfile

**Prerequisites:**
```bash
# Install Jenkins plugins:
# - Docker Pipeline
# - Kubernetes CLI
# - Pipeline
# - Git
# - Slack Notification (optional)

# Configure Jenkins credentials:
# - dockerhub-credentials (username + password)
# - kubeconfig (file credential)
# - github-token (for webhooks)
```

**Create `Jenkinsfile`:**
```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'your-dockerhub/equipment-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS = credentials('dockerhub-credentials')
        KUBECONFIG = credentials('kubeconfig')
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/your-username/equipment-manager.git'
            }
        }
        
        stage('Unit Tests') {
            steps {
                sh 'mvn clean test'
            }
            post {
                always {
                    junit '**/target/surefire-reports/*.xml'
                }
            }
        }
        
        stage('Build JAR') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }
        
        stage('Integration Tests') {
            steps {
                sh 'mvn verify -DskipUnitTests'
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                sh """
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                    aquasec/trivy:latest image \
                    --severity HIGH,CRITICAL \
                    ${DOCKER_IMAGE}:${DOCKER_TAG}
                """
            }
        }
        
        stage('Push to DockerHub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push('latest')
                    }
                }
            }
        }
        
        stage('Update Helm Values') {
            steps {
                sh """
                    sed -i 's/tag: .*/tag: "${DOCKER_TAG}"/' helm/equipment-manager/values.yaml
                """
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    export KUBECONFIG=${KUBECONFIG}
                    helm upgrade --install equipment-manager ./helm/equipment-manager \
                        --set image.tag=${DOCKER_TAG} \
                        --namespace production \
                        --create-namespace \
                        --wait \
                        --timeout 5m
                """
            }
        }
        
        stage('Smoke Tests') {
            steps {
                sh """
                    sleep 30
                    curl -f https://equipment.yourdomain.com/actuator/health || exit 1
                """
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
            // Slack notification (if configured)
            // slackSend(color: 'good', message: "Deployment succeeded: ${env.BUILD_URL}")
        }
        failure {
            echo 'Deployment failed!'
            // slackSend(color: 'danger', message: "Deployment failed: ${env.BUILD_URL}")
        }
        always {
            cleanWs()
        }
    }
}
```

#### 🔸 GitHub Webhook Configuration

1. **In GitHub repository:**
   - Settings → Webhooks → Add webhook
   - Payload URL: `http://your-jenkins-url/github-webhook/`
   - Content type: `application/json`
   - Events: `Just the push event`

2. **In Jenkins:**
   - Job → Configure → Build Triggers
   - ✅ GitHub hook trigger for GITScm polling

#### 🔸 Advanced: GitOps with ArgoCD (Optional)

**Why GitOps?**
- Git as single source of truth
- Automated sync between Git and cluster
- Easy rollbacks
- Audit trail

**Install ArgoCD:**
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

**Create Application:**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: equipment-manager
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-username/equipment-manager.git
    targetRevision: HEAD
    path: helm/equipment-manager
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

#### 📌 Result
Complete automation: `git push` → tests → build → deploy → live in production.

#### 📚 Resources
- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [ArgoCD Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/)

---

### 📊 PHASE 7 — Observability & Monitoring (1–2 weeks)

#### 🔸 Goals
- Collect and visualize metrics (Prometheus + Grafana)
- Centralize logs (Loki)
- Implement distributed tracing (Jaeger)
- Set up alerts
- Create custom dashboards

#### 🔸 The Observability Stack

```
Application
    ↓
Spring Boot Actuator (exposes metrics)
    ↓
Prometheus (collects & stores metrics)
    ↓
Grafana (visualizes metrics)
    ↓
Alerts (PagerDuty, Slack, Email)

Application Logs
    ↓
Loki (log aggregation)
    ↓
Grafana (log viewer)

Application Traces
    ↓
Jaeger (distributed tracing)
```

#### 🔸 Hands-on Setup

**1. Install Prometheus Stack with Helm:**
```bash
# Add Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack (includes Prometheus, Grafana, AlertManager)
helm install monitoring prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.adminPassword=admin123

# Access Grafana
kubectl port-forward -n monitoring svc/monitoring-grafana 3000:80
# Open: http://localhost:3000
# Login: admin / admin123
```

**2. Expose Spring Boot Metrics:**

Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

Add to `application.yml`:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
  endpoint:
    health:
      show-details: always
      probes:
        enabled: true
```

**3. Create ServiceMonitor for your app:**
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: equipment-app-metrics
  namespace: production
  labels:
    app: equipment-app
spec:
  selector:
    matchLabels:
      app: equipment-app
  endpoints:
  - port: http
    path: /actuator/prometheus
    interval: 30s
```

**4. Create Custom Grafana Dashboard:**

Import dashboard JSON:
```json
{
  "dashboard": {
    "title": "Equipment Manager Metrics",
    "panels": [
      {
        "title": "HTTP Request Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count{job=\"equipment-app\"}[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_server_requests_seconds_bucket{job=\"equipment-app\"}[5m]))"
          }
        ]
      },
      {
        "title": "Memory Usage",
        "targets": [
          {
            "expr": "jvm_memory_used_bytes{job=\"equipment-app\"}"
          }
        ]
      },
      {
        "title": "CPU Usage",
        "targets": [
          {
            "expr": "rate(process_cpu_seconds_total{job=\"equipment-app\"}[5m])"
          }
        ]
      },
      {
        "title": "Database Connection Pool",
        "targets": [
          {
            "expr": "hikaricp_connections_active{job=\"equipment-app\"}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_server_requests_seconds_count{job=\"equipment-app\",status=~\"5..\"}[5m])"
          }
        ]
      }
    ]
  }
}
```

**5. Set up Alerts:**

Create `PrometheusRule`:
```yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: equipment-app-alerts
  namespace: monitoring
spec:
  groups:
  - name: equipment-app
    interval: 30s
    rules:
    - alert: HighErrorRate
      expr: |
        rate(http_server_requests_seconds_count{job="equipment-app",status=~"5.."}[5m]) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value }} errors/sec"
    
    - alert: HighResponseTime
      expr: |
        histogram_quantile(0.95, rate(http_server_requests_seconds_bucket{job="equipment-app"}[5m])) > 2
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High response time detected"
        description: "p95 response time is {{ $value }} seconds"
    
    - alert: PodDown
      expr: |
        up{job="equipment-app"} == 0
      for: 2m
      labels:
        severity: critical
      annotations:
        summary: "Pod is down"
        description: "Equipment app pod has been down for more than 2 minutes"
    
    - alert: HighMemoryUsage
      expr: |
        (jvm_memory_used_bytes{job="equipment-app",area="heap"} / jvm_memory_max_bytes{job="equipment-app",area="heap"}) > 0.9
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage"
        description: "JVM heap usage is {{ $value | humanizePercentage }}"
```

**6. Install Loki for Log Aggregation:**
```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set grafana.enabled=false \
  --set prometheus.enabled=false \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=10Gi
```

**Add Loki datasource in Grafana:**
- Configuration → Data Sources → Add data source
- Select Loki
- URL: `http://loki:3100`
- Save & Test

**7. Install Jaeger for Distributed Tracing:**
```bash
kubectl create namespace observability
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/crds/jaegertracing.io_jaegers_crd.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/service_account.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/role.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/role_binding.yaml
kubectl apply -f https://raw.githubusercontent.com/jaegertracing/jaeger-operator/main/deploy/operator.yaml

# Create Jaeger instance
cat <<EOF | kubectl apply -f -
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: jaeger
  namespace: observability
spec:
  strategy: allInOne
  storage:
    type: memory
EOF
```

**Add OpenTelemetry to Spring Boot:**
```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-api</artifactId>
</dependency>
<dependency>
    <groupId>io.opentelemetry.instrumentation</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

```yaml
# application.yml
otel:
  exporter:
    jaeger:
      endpoint: http://jaeger-collector:14250
  service:
    name: equipment-manager
```

**8. Access Jaeger UI:**
```bash
kubectl port-forward -n observability svc/jaeger-query 16686:16686
# Open: http://localhost:16686
```

#### 🔸 Key Metrics to Monitor

**Application Metrics:**
- Request rate (requests/sec)
- Response time (p50, p95, p99)
- Error rate
- Active threads
- JVM heap usage
- Garbage collection time
- Database connection pool size

**Infrastructure Metrics:**
- CPU usage per pod
- Memory usage per pod
- Network I/O
- Disk I/O
- Pod restarts
- Node capacity

**Business Metrics:**
- Number of active users
- Equipment items created/updated/deleted
- API endpoint usage
- Feature adoption rates

#### 🔸 Custom Metrics in Spring Boot

Add custom metrics:
```java
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;

@Service
public class EquipmentService {
    
    private final Counter equipmentCreatedCounter;
    private final Timer equipmentSearchTimer;
    
    public EquipmentService(MeterRegistry registry) {
        this.equipmentCreatedCounter = Counter.builder("equipment.created")
            .description("Number of equipment items created")
            .tag("service", "equipment")
            .register(registry);
            
        this.equipmentSearchTimer = Timer.builder("equipment.search.time")
            .description("Time taken to search equipment")
            .register(registry);
    }
    
    public Equipment createEquipment(Equipment equipment) {
        Equipment saved = repository.save(equipment);
        equipmentCreatedCounter.increment();
        return saved;
    }
    
    public List<Equipment> searchEquipment(String query) {
        return equipmentSearchTimer.record(() -> {
            return repository.findByNameContaining(query);
        });
    }
}
```

#### 📌 Result
Complete observability of your application with:
- Real-time metrics visualization
- Centralized log viewing
- Distributed request tracing
- Automated alerting
- Performance insights

#### 📚 Resources
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Spring Boot Actuator Guide](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)

---

### 🛡️ PHASE 8 — Security & Production Readiness (1–2 weeks)

#### 🔸 Goals
- Implement proper secrets management
- Secure container images
- Configure RBAC
- Implement network policies
- Add authentication & authorization
- Backup and disaster recovery

#### 🔸 Security Checklist

**1. Secrets Management:**

✅ Never commit secrets to Git
✅ Use AWS Secrets Manager or HashiCorp Vault
✅ Rotate secrets regularly
✅ Use least privilege access

**Install External Secrets Operator:**
```bash
helm repo add external-secrets https://charts.external-secrets.io
helm install external-secrets external-secrets/external-secrets \
  --namespace external-secrets-system \
  --create-namespace
```

**Create SecretStore:**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: aws-secrets-manager
  namespace: production
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets-sa
```

**Create ExternalSecret:**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: db-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: db-secret
    creationPolicy: Owner
  data:
  - secretKey: username
    remoteRef:
      key: equipment/db-credentials
      property: username
  - secretKey: password
    remoteRef:
      key: equipment/db-credentials
      property: password
```

**2. RBAC (Role-Based Access Control):**

Create ServiceAccount with limited permissions:
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: equipment-app-sa
  namespace: production
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: equipment-app-role
  namespace: production
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: equipment-app-binding
  namespace: production
subjects:
- kind: ServiceAccount
  name: equipment-app-sa
  namespace: production
roleRef:
  kind: Role
  name: equipment-app-role
  apiGroup: rbac.authorization.k8s.io
```

Update Deployment to use ServiceAccount:
```yaml
spec:
  template:
    spec:
      serviceAccountName: equipment-app-sa
```

**3. Network Policies:**

Restrict traffic between pods:
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: equipment-app-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: equipment-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  # Allow DNS
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
  # Allow MySQL
  - to:
    - podSelector:
        matchLabels:
          app: mysql
    ports:
    - protocol: TCP
      port: 3306
  # Allow external HTTPS
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443
```

**4. Pod Security Standards:**

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

Update Deployment for security:
```yaml
spec:
  template:
    spec:
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
        seccompProfile:
          type: RuntimeDefault
      containers:
      - name: app
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        volumeMounts:
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: tmp
        emptyDir: {}
```

**5. Image Scanning in CI/CD:**

Already covered in Phase 6, but ensure it's enforced:
```groovy
stage('Security Scan') {
    steps {
        sh """
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
            aquasec/trivy:latest image \
            --exit-code 1 \
            --severity HIGH,CRITICAL \
            ${DOCKER_IMAGE}:${DOCKER_TAG}
        """
    }
}
```

**6. OAuth2 Authentication with Spring Security:**

Add dependencies:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

Configure security:
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
            );
        return http.build();
    }
}
```

**7. Rate Limiting with NGINX Ingress:**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: equipment-ingress
  annotations:
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/limit-rps: "10"
    nginx.ingress.kubernetes.io/limit-connections: "20"
spec:
  # ... rest of ingress config
```

**8. Backup Strategy:**

**For Kubernetes resources:**
```bash
# Install Velero
wget https://github.com/vmware-tanzu/velero/releases/download/v1.12.0/velero-v1.12.0-linux-amd64.tar.gz
tar -xvf velero-v1.12.0-linux-amd64.tar.gz
sudo mv velero-v1.12.0-linux-amd64/velero /usr/local/bin/

# Configure AWS S3 backup
velero install \
    --provider aws \
    --plugins velero/velero-plugin-for-aws:v1.8.0 \
    --bucket equipment-backups \
    --backup-location-config region=us-east-1 \
    --snapshot-location-config region=us-east-1 \
    --secret-file ./credentials-velero

# Create backup schedule
velero schedule create daily-backup \
    --schedule="0 2 * * *" \
    --include-namespaces production
```

**For RDS:**
```bash
# Enable automated backups (via AWS Console or CLI)
aws rds modify-db-instance \
  --db-instance-identifier equipment-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00" \
  --apply-immediately
```

**9. Disaster Recovery Plan:**

Document and test:
```markdown
# DR Runbook

## RPO (Recovery Point Objective): 1 hour
## RTO (Recovery Time Objective): 2 hours

### Backup Locations:
- K8s resources: S3 bucket (velero)
- Database: RDS automated backups (7 days retention)
- Docker images: DockerHub registry

### Recovery Procedures:

1. Restore Kubernetes cluster:
   ```bash
   velero restore create --from-backup daily-backup-20241113
   ```

2. Restore database:
   ```bash
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier equipment-db-restored \
     --db-snapshot-identifier equipment-db-snapshot-20241113
   ```

3. Update connection strings and redeploy

### Testing Schedule:
- Monthly DR drill
- Quarterly full recovery test
```

#### 🔸 Production Readiness Checklist

Before going to production:

**Infrastructure:**
- [ ] Multi-AZ deployment for high availability
- [ ] Auto-scaling configured (HPA)
- [ ] Resource requests/limits set
- [ ] Health checks configured (liveness, readiness, startup probes)
- [ ] TLS/SSL certificates installed
- [ ] DNS configured
- [ ] Load balancer configured

**Security:**
- [ ] All secrets in secrets manager (not in code)
- [ ] RBAC configured
- [ ] Network policies in place
- [ ] Pod security standards enforced
- [ ] Container images scanned
- [ ] OAuth2/JWT authentication implemented
- [ ] Rate limiting configured

**Observability:**
- [ ] Metrics collection enabled
- [ ] Dashboards created
- [ ] Alerts configured
- [ ] Log aggregation working
- [ ] Distributed tracing enabled
- [ ] On-call rotation established

**Reliability:**
- [ ] Backup strategy implemented
- [ ] DR plan documented and tested
- [ ] Database replication configured
- [ ] Graceful shutdown implemented
- [ ] Circuit breakers configured (Resilience4j)

**CI/CD:**
- [ ] Automated testing (unit, integration, smoke)
- [ ] Blue-green or canary deployment strategy
- [ ] Rollback procedures documented
- [ ] Change management process defined

**Documentation:**
- [ ] Architecture diagram
- [ ] Runbooks for common issues
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment procedures
- [ ] Troubleshooting guide

#### 📌 Result
A production-grade, secure, highly available system with proper backup, monitoring, and incident response procedures.

#### 📚 Resources
- [Kubernetes Security Best Practices](https://kubernetes.io/docs/concepts/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Velero Documentation](https://velero.io/docs/)

---

## 🧱 FINAL ARCHITECTURE

```
                         INTERNET
                            |
                    [AWS Route53 DNS]
                            |
                  [AWS Certificate Manager]
                            |
              [AWS Application Load Balancer]
                            |
                    [TLS Termination]
                            |
            ┌───────────────┴───────────────┐
            │                               │
      [NGINX Ingress Controller]     [Network Policies]
            │                               │
            └───────────────┬───────────────┘
                            |
              ┌─────────────┼─────────────┐
              |             |             |
        [Pod: App]    [Pod: App]    [Pod: App]
        (replica 1)   (replica 2)   (replica 3)
              |             |             |
              └─────────────┴─────────────┘
                            |
                    [Service: ClusterIP]
                            |
                ┌───────────┴───────────┐
                |                       |
          [AWS RDS MySQL]      [Redis Cache]
          (Multi-AZ)           (Optional)
                |
          [Automated Backups]


        OBSERVABILITY LAYER:
        ┌──────────────────────────────────┐
        │  Prometheus → Grafana (Metrics)  │
        │  Loki → Grafana (Logs)           │
        │  Jaeger (Traces)                 │
        │  AlertManager (Alerts)           │
        └──────────────────────────────────┘

        CI/CD PIPELINE:
        GitHub → Jenkins → Docker Build → 
        Security Scan → DockerHub → 
        Helm Deploy → Smoke Tests → 
        Slack Notification
```

**Technologies Used:**
- ✅ Docker (containerization)
- ✅ Kubernetes (orchestration)
- ✅ Helm (packaging)
- ✅ AWS EKS (managed K8s)
- ✅ AWS RDS (managed database)
- ✅ NGINX Ingress (routing)
- ✅ Jenkins (CI/CD)
- ✅ Prometheus & Grafana (monitoring)
- ✅ Loki (logging)
- ✅ Jaeger (tracing)
- ✅ External Secrets Operator (secrets)
- ✅ Velero (backups)

**This is exactly what backend/cloud engineers build in real companies.**

---

## 📅 12-WEEK DETAILED SCHEDULE

### **Week 1-2: Foundation & Local Development**
- Days 1-3: Multi-stage Dockerfile, Docker Compose setup
- Days 4-5: Image optimization, security scanning
- Days 6-7: Environment variables, secrets management
- Weekend: Review and catch-up

### **Week 3-4: Kubernetes Basics**
- Days 1-2: Install Minikube, learn kubectl basics
- Days 3-4: Create Deployments, Services
- Days 5-6: ConfigMaps, Secrets, PVCs
- Day 7: Deploy full app with MySQL
- Weekend: Troubleshooting exercises

### **Week 5: Networking & Ingress**
- Days 1-2: Service types, networking concepts
- Days 3-4: Install NGINX Ingress, create rules
- Days 5-6: TLS certificates, HTTPS setup
- Day 7: Network policies
- Weekend: Test different routing scenarios

### **Week 6: Helm & Packaging**
- Days 1-2: Learn Helm basics, create chart
- Days 3-4: Templating, values files
- Days 5-6: Multi-environment setup
- Day 7: Package and deploy
- Weekend: Create production-ready chart

### **Week 7-8: Cloud Deployment (AWS)**
- Days 1-2: AWS account setup, cost management
- Days 3-5: Create EKS cluster, configure access
- Days 6-8: Deploy app to EKS, configure RDS
- Days 9-10: DNS, SSL certificates, Load Balancer
- Days 11-12: Security groups, IAM roles
- Weekend: Cost optimization review

### **Week 9: CI/CD Pipeline**
- Days 1-2: Jenkins setup, credentials configuration
- Days 3-4: Create Jenkinsfile with testing stages
- Days 5-6: Docker build and push automation
- Day 7: Helm deployment automation
- Weekend: Test full pipeline end-to-end

### **Week 10: Observability**
- Days 1-2: Install Prometheus & Grafana
- Days 3-4: Configure Spring Boot metrics
- Day 5: Create custom dashboards
- Days 6-7: Install Loki and Jaeger
- Weekend: Set up alerts and test

### **Week 11: Security & Production Hardening**
- Days 1-2: RBAC, Network Policies
- Days 3-4: Secrets management with External Secrets
- Day 5: OAuth2 authentication
- Days 6-7: Image scanning, vulnerability fixes
- Weekend: Security audit

### **Week 12: Production Readiness**
- Days 1-2: Backup strategy implementation
- Days 3-4: DR testing
- Day 5: Documentation
- Days 6-7: Load testing, performance optimization
- Weekend: Final review and portfolio preparation

**Daily Time Commitment:** 1.5-2 hours on weekdays, 3-4 hours on weekends

---

## 🌐 CLOUD & DEVOPS TECHNOLOGY ROADMAP DIAGRAM

```
                    ┌───────────────────────────────┐
                    │        WEB DEVELOPMENT         │
                    └───────────────────────────────┘
                               │
                               ▼
       ┌─────────────────────────────────────────────────────┐
       │                BACKEND FOUNDATIONS                  │
       │  - Java, Spring MVC / Spring Boot                   │
       │  - REST APIs                                        │
       │  - MySQL / JDBC / JPA                               │
       └─────────────────────────────────────────────────────┘
                               │
                               ▼
       ┌─────────────────────────────────────────────────────┐
       │                  BUILD & VERSIONING                 │
       │  - Maven / Gradle                                   │
       │  - Git / GitHub                                     │
       