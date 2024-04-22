const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { trace } = require("@opentelemetry/api");

// Instrumentations
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");
const { MongoDBInstrumentation } = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");

// Jaeger Exporter
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const jaegerExporter = new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces'
});

// Exporter
module.exports = (serviceName) => {
   const provider = new NodeTracerProvider({
       resource: new Resource({
           [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
       }),
   });

   // Add Jaeger as the span processor
   provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));

   // Register the provider to start tracing
   provider.register();

   // Register instrumentations
   registerInstrumentations({
       instrumentations: [
           new HttpInstrumentation(),
           new ExpressInstrumentation(),
           new MongoDBInstrumentation(),
       ],
       tracerProvider: provider,
   });

   // Return a tracer for the specified service
   return trace.getTracer(serviceName);
};
