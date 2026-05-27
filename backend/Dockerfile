# Build stage using Maven and JDK 21
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage using lightweight JRE 21
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/praxis-backend-1.0.0.jar app.jar
EXPOSE 5000
ENTRYPOINT ["java", "-jar", "app.jar"]
