# Stage 1: Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven configuration
COPY pom.xml .

# Copy Java source code
COPY src ./src

# Build the application
RUN mvn -B -DskipTests package

# Stage 2: Run the application
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the generated JAR
COPY --from=build /app/target/exam-seating-1.0.0..jar app.jar

# Expose the application port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
