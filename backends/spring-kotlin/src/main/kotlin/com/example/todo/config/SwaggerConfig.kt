package com.example.todo.config

import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class SwaggerConfig : WebMvcConfigurer {

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // openapi3.yaml은 classpath:/static/에 위치 → Spring Boot가 자동 서빙 (/openapi3.yaml)
        // Webjars를 통한 Swagger UI 정적 파일 서빙
        registry.addResourceHandler("/swagger-ui/**")
            .addResourceLocations("classpath:/META-INF/resources/webjars/swagger-ui/5.18.2/")
    }
}

@Controller
class SwaggerRedirectController {
    @GetMapping("/swagger-ui", "/swagger-ui/")
    fun redirectToSwaggerUi(): String {
        return "redirect:/swagger-ui/index.html"
    }
}

@RestController
class SwaggerApiController {

    @GetMapping("/swagger-ui/swagger-initializer.js", produces = ["application/javascript"])
    @ResponseBody
    fun swaggerInitializer(): String {
        return """
            window.onload = function() {
              window.ui = SwaggerUIBundle({
                url: "/openapi3.yaml",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                  SwaggerUIBundle.presets.apis,
                  SwaggerUIStandalonePreset
                ],
                plugins: [
                  SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
              });
            };
        """.trimIndent()
    }
}
