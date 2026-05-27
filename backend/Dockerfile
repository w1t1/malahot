# Runtime only — JAR is pre-built on host by deploy script
FROM alpine:latest
RUN apk add --no-cache openjdk17-jre
WORKDIR /app
COPY target/*.jar app.jar

ENV JAVA_OPTS="-Xms128m -Xmx384m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
