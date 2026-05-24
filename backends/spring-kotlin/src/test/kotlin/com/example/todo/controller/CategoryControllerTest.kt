package com.example.todo.controller

import com.example.todo.dto.CategoryRequest
import com.example.todo.dto.CategoryResponse
import com.example.todo.service.CategoryService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.BDDMockito.willDoNothing
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.delete
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.pathParameters
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import com.epages.restdocs.apispec.MockMvcRestDocumentationWrapper.document

@WebMvcTest(CategoryController::class)
@AutoConfigureRestDocs(uriScheme = "http", uriHost = "localhost", uriPort = 8080)
class CategoryControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var categoryService: CategoryService

    @Test
    fun getCategoriesTest() {
        val responses = listOf(
            CategoryResponse(1L, "Work", "#FF5733"),
            CategoryResponse(2L, "Personal", "#33FF57")
        )
        given(categoryService.getAllCategories()).willReturn(responses)

        mockMvc.perform(
            get("/api/categories")
                .accept(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.size()").value(2))
            .andDo(
                document(
                    "get-categories",
                    description = "Get category list",
                    snippets = arrayOf(
                        responseFields(
                            fieldWithPath("[].id").type(JsonFieldType.NUMBER).description("Category ID"),
                            fieldWithPath("[].name").type(JsonFieldType.STRING).description("Category Name"),
                            fieldWithPath("[].color").type(JsonFieldType.STRING).description("Category Color Hex")
                        )
                    )
                )
            )
    }

    @Test
    fun createCategoryTest() {
        val request = CategoryRequest("Study", "#3357FF")
        val response = CategoryResponse(3L, "Study", "#3357FF")
        given(categoryService.createCategory(request)).willReturn(response)

        mockMvc.perform(
            post("/api/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .accept(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(3L))
            .andDo(
                document(
                    "create-category",
                    description = "Create new category",
                    snippets = arrayOf(
                        requestFields(
                            fieldWithPath("name").type(JsonFieldType.STRING).description("Category Name"),
                            fieldWithPath("color").type(JsonFieldType.STRING).description("Category Color Hex")
                        ),
                        responseFields(
                            fieldWithPath("id").type(JsonFieldType.NUMBER).description("Created Category ID"),
                            fieldWithPath("name").type(JsonFieldType.STRING).description("Category Name"),
                            fieldWithPath("color").type(JsonFieldType.STRING).description("Category Color Hex")
                        )
                    )
                )
            )
    }

    @Test
    fun deleteCategoryTest() {
        val categoryId = 1L
        willDoNothing().given(categoryService).deleteCategory(categoryId)

        mockMvc.perform(
            delete("/api/categories/{id}", categoryId)
        )
            .andExpect(status().isNoContent)
            .andDo(
                document(
                    "delete-category",
                    description = "Delete category by ID",
                    snippets = arrayOf(
                        pathParameters(
                            parameterWithName("id").description("Category ID to delete")
                        )
                    )
                )
            )
    }
}
