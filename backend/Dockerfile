# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .
# Download dependencies (cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build application
RUN mvn clean package -DskipTests

# Runtime stage
# Using Debian slim instead of Alpine for ARM64 compatibility
FROM eclipse-temurin:17-jre-jammy

# Create non-root user for security
RUN groupadd --system spring && \
    useradd --system --gid spring spring

WORKDIR /app

# Copy JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership to non-root user
RUN chown spring:spring app.jar

# Switch to non-root user
USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java","-jar","/app.jar"]