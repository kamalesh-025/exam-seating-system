# Stage 1: Build the Spring Boot application
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven configuration
COPY pom.xml .

# Copy Java source code
COPY src ./src

# Build the application
RUN mvn -B -q -DskipTests package

# Stage 2: Run the application
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the generated JAR
COPY --from=build /app/target/exam-seating-1.0.0.jar app.jar

# Render assigns the port through the PORT env var (10000 by default).
EXPOSE 10000

ENV TZ=UTC

# Start the application
ENTRYPOINT ["java", \
  "-XX:MaxRAMPercentage=70.0", \
  "-XX:MaxMetaspaceSize=160m", \
  "-XX:+UseSerialGC", \
  "-Djava.awt.headless=true", \
  "-jar", "app.jar"]
