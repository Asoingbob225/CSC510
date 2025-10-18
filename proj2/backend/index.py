from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# FastAPI应用配置
app = FastAPI(
    title="Eatsential API",
    description="AI-powered Precision Nutrition Platform API",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc", # ReDoc UI
    openapi_url="/openapi.json"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # 前端开发服务器
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 自定义OpenAPI配置
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Eatsential API",
        version="1.0.0",
        description="""
        # Eatsential - Precision Nutrition Platform API
        
        YOUR PLATE, YOUR RULES. PRECISION NUTRITION FOR BODY AND MIND.
        
        ## 核心功能模块
        
        1. **Dual-Dimension Health Profile** - 身心双维度健康档案
        2. **Scientific Nutrition Engine** - RAG驱动的科学推荐引擎  
        3. **AI Health Concierge** - LLM驱动的健康对话助手
        4. **Curated Healthy Restaurants** - 精选健康餐厅发现
        5. **Visual Wellness Journey** - 进度追踪可视化
        6. **Zero-tolerance Allergen Safety** - 过敏原零容错安全机制
        
        ## 认证方式
        
        API使用Bearer Token认证，在请求头中添加：
        ```
        Authorization: Bearer <your_token>
        ```
        """,
        routes=app.routes,
    )
    
    # 添加API标签分组
    openapi_schema["tags"] = [
        {
            "name": "System",
            "description": "系统健康检查和基础信息"
        },
        {
            "name": "Authentication", 
            "description": "用户认证和授权管理"
        },
        {
            "name": "Health Profile", 
            "description": "双维度健康档案管理 (身体 + 心理)"
        },
        {
            "name": "Nutrition Engine", 
            "description": "科学营养推荐引擎 (RAG驱动)"
        },
        {
            "name": "AI Concierge", 
            "description": "LLM健康助手对话接口"
        },
        {
            "name": "Restaurant Discovery", 
            "description": "精选健康餐厅合作伙伴"
        },
        {
            "name": "Visual Wellness", 
            "description": "进度可视化和数据分析"
        },
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# ================================
# 数据模型定义 (Pydantic Schemas)
# ================================

class HealthStatus(BaseModel):
    """系统健康状态模型"""
    status: str = Field(default="healthy", description="系统状态")
    timestamp: datetime = Field(default_factory=datetime.now, description="检查时间")
    version: str = Field(default="1.0.0", description="API版本")
    services: Dict[str, str] = Field(default_factory=dict, description="服务状态")

class HealthProfileCreate(BaseModel):
    """创建健康档案请求模型"""
    allergies: List[str] = Field(
        ..., 
        description="过敏原列表 - 零容错安全机制",
        example=["peanuts", "shellfish", "dairy"]
    )
    fitness_goals: List[str] = Field(
        ..., 
        description="健身目标 - 影响营养推荐",
        example=["muscle_gain", "weight_loss", "endurance"]
    )
    dietary_preferences: List[str] = Field(
        ..., 
        description="饮食偏好 - 决定食物选择范围",
        example=["vegan", "keto", "mediterranean"]
    )
    mental_wellness_goals: List[str] = Field(
        ..., 
        description="心理健康目标 - 情绪调节食物推荐",
        example=["stress_reduction", "mood_boost", "sleep_improvement"]
    )
    medical_conditions: Optional[List[str]] = Field(
        default=[], 
        description="医疗状况 - 特殊饮食需求",
        example=["diabetes", "hypertension", "celiac_disease"]
    )

class HealthProfileResponse(BaseModel):
    """健康档案响应模型"""
    profile_id: str = Field(..., description="档案唯一标识")
    user_id: str = Field(..., description="用户ID")
    allergies: List[str] = Field(..., description="过敏原列表")
    fitness_goals: List[str] = Field(..., description="健身目标")
    dietary_preferences: List[str] = Field(..., description="饮食偏好")
    mental_wellness_goals: List[str] = Field(..., description="心理健康目标")
    medical_conditions: List[str] = Field(..., description="医疗状况")
    created_at: datetime = Field(..., description="创建时间")
    updated_at: datetime = Field(..., description="最后更新时间")
    nutrition_score: Optional[float] = Field(None, description="营养匹配分数 (0-100)")

# ================================
# 依赖注入函数
# ================================

async def get_current_user() -> str:
    """获取当前认证用户ID (模拟)"""
    # 实际项目中这里会验证JWT token
    return "user_123"

# ================================
# API路由定义
# ================================

@app.get(
    "/health", 
    response_model=HealthStatus,
    tags=["System"],
    summary="系统健康检查",
    description="检查API服务器和相关服务的运行状态"
)
async def health_check() -> HealthStatus:
    """
    系统健康检查端点
    
    返回API服务器状态、版本信息和相关服务连接状态。
    用于监控系统可用性和进行负载均衡健康检查。
    
    Returns:
        HealthStatus: 包含系统状态的详细信息
    """
    return HealthStatus(
        status="healthy",
        services={
            "database": "connected",
            "redis": "connected", 
            "llm_service": "available",
            "rag_engine": "ready"
        }
    )

@app.get("/api")
def read_root():
    return {"The server is running": "Hello World"}

@app.post(
    "/api/v1/health-profile",
    response_model=HealthProfileResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Health Profile"],
    summary="创建用户健康档案",
    description="""
    创建包含身心双维度的用户健康档案。
    
    ## 功能特点
    - **零容错过敏原安全**: 严格过滤含有用户过敏原的食物
    - **双维度健康管理**: 同时考虑身体健康和心理健康目标
    - **个性化推荐基础**: 为后续营养推荐提供精准用户画像
    
    ## 使用场景
    - 新用户注册后的首次档案创建
    - 用户健康状况发生变化时的档案更新
    - 为营养推荐引擎提供用户偏好数据
    """
)
async def create_health_profile(
    profile: HealthProfileCreate,
    user_id: str = Depends(get_current_user)
) -> HealthProfileResponse:
    """
    创建用户健康档案
    
    Args:
        profile: 健康档案数据，包含过敏原、健身目标等信息
        user_id: 当前认证用户ID (通过依赖注入获取)
    
    Returns:
        HealthProfileResponse: 创建成功的健康档案，包含系统生成的ID和时间戳
    
    Raises:
        HTTPException: 
            - 400: 档案数据验证失败
            - 409: 用户档案已存在  
            - 500: 服务器内部错误
    
    Example:
        ```python
        # 请求示例
        {
            "allergies": ["peanuts", "shellfish"],
            "fitness_goals": ["muscle_gain", "weight_loss"], 
            "dietary_preferences": ["vegan"],
            "mental_wellness_goals": ["stress_reduction"]
        }
        ```
    """
    try:
        # 模拟档案创建逻辑
        profile_id = f"profile_{user_id}_{int(datetime.now().timestamp())}"
        
        # 计算营养匹配分数 (模拟)
        nutrition_score = 85.5
        
        # 构造响应
        return HealthProfileResponse(
            profile_id=profile_id,
            user_id=user_id,
            allergies=profile.allergies,
            fitness_goals=profile.fitness_goals,
            dietary_preferences=profile.dietary_preferences,
            mental_wellness_goals=profile.mental_wellness_goals,
            medical_conditions=profile.medical_conditions or [],
            created_at=datetime.now(),
            updated_at=datetime.now(),
            nutrition_score=nutrition_score
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create health profile: {str(e)}"
        )

@app.get(
    "/api/v1/health-profile/{profile_id}",
    response_model=HealthProfileResponse,
    tags=["Health Profile"],
    summary="获取用户健康档案",
    description="根据档案ID获取用户的完整健康档案信息"
)
async def get_health_profile(
    profile_id: str,
    user_id: str = Depends(get_current_user)
) -> HealthProfileResponse:
    """
    获取用户健康档案详情
    
    Args:
        profile_id: 健康档案ID
        user_id: 当前认证用户ID
    
    Returns:
        HealthProfileResponse: 用户健康档案详细信息
        
    Raises:
        HTTPException:
            - 404: 档案不存在或无权限访问
            - 500: 服务器内部错误
    """
    # 模拟档案查询
    if not profile_id.startswith("profile_"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health profile not found"
        )
    
    # 返回模拟数据
    return HealthProfileResponse(
        profile_id=profile_id,
        user_id=user_id,
        allergies=["peanuts", "shellfish"],
        fitness_goals=["muscle_gain"],
        dietary_preferences=["vegan"],
        mental_wellness_goals=["stress_reduction", "mood_boost"],
        medical_conditions=["diabetes"],
        created_at=datetime.now(),
        updated_at=datetime.now(),
        nutrition_score=87.2
    )
