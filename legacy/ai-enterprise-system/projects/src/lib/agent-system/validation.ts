/**
 * 智能体系统验证工具
 */

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

/**
 * 创建验证结果
 */
function createResult(valid: boolean, errors: ValidationError[] = []): ValidationResult {
  return { valid, errors };
}

/**
 * 添加错误
 */
function addError(errors: ValidationError[], field: string, message: string, code: string): ValidationError[] {
  return [...errors, { field, message, code }];
}

/**
 * 验证规则
 */
export const validators = {
  /**
   * 必填验证
   */
  required: (value: any, fieldName: string): ValidationResult => {
    if (value === undefined || value === null || value === '') {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}是必填字段`,
        code: 'REQUIRED',
      }]);
    }
    return createResult(true);
  },

  /**
   * 字符串长度验证
   */
  minLength: (value: string, min: number, fieldName: string): ValidationResult => {
    if (typeof value !== 'string' || value.length < min) {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}长度不能少于${min}个字符`,
        code: 'MIN_LENGTH',
      }]);
    }
    return createResult(true);
  },

  /**
   * 字符串最大长度验证
   */
  maxLength: (value: string, max: number, fieldName: string): ValidationResult => {
    if (typeof value === 'string' && value.length > max) {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}长度不能超过${max}个字符`,
        code: 'MAX_LENGTH',
      }]);
    }
    return createResult(true);
  },

  /**
   * 数字范围验证
   */
  range: (value: number, min: number, max: number, fieldName: string): ValidationResult => {
    if (typeof value !== 'number' || value < min || value > max) {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}必须在${min}到${max}之间`,
        code: 'RANGE',
      }]);
    }
    return createResult(true);
  },

  /**
   * 邮箱验证
   */
  email: (value: string, fieldName: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}不是有效的邮箱地址`,
        code: 'INVALID_EMAIL',
      }]);
    }
    return createResult(true);
  },

  /**
   * URL验证
   */
  url: (value: string, fieldName: string): ValidationResult => {
    try {
      new URL(value);
      return createResult(true);
    } catch {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}不是有效的URL`,
        code: 'INVALID_URL',
      }]);
    }
  },

  /**
   * UUID验证
   */
  uuid: (value: string, fieldName: string): ValidationResult => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}不是有效的UUID`,
        code: 'INVALID_UUID',
      }]);
    }
    return createResult(true);
  },

  /**
   * 枚举值验证
   */
  enum: <T extends string | number>(value: T, allowed: T[], fieldName: string): ValidationResult => {
    if (!allowed.includes(value)) {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}必须是以下值之一: ${allowed.join(', ')}`,
        code: 'INVALID_ENUM',
      }]);
    }
    return createResult(true);
  },

  /**
   * 正则验证
   */
  pattern: (value: string, pattern: RegExp, fieldName: string): ValidationResult => {
    if (!pattern.test(value)) {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}格式不正确`,
        code: 'INVALID_PATTERN',
      }]);
    }
    return createResult(true);
  },

  /**
   * 日期验证
   */
  date: (value: string | Date, fieldName: string): ValidationResult => {
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) {
      return createResult(false, [{
        field: fieldName,
        message: `${fieldName}不是有效的日期`,
        code: 'INVALID_DATE',
      }]);
    }
    return createResult(true);
  },
};

/**
 * 验证器组合
 */
export class Validator {
  private errors: ValidationError[] = [];

  /**
   * 添加验证
   */
  validate(value: any, rules: Array<(v: any, f: string) => ValidationResult>, fieldName: string): this {
    for (const rule of rules) {
      const result = rule(value, fieldName);
      if (!result.valid) {
        this.errors = [...this.errors, ...result.errors];
        break;
      }
    }
    return this;
  }

  /**
   * 获取结果
   */
  getResult(): ValidationResult {
    return createResult(this.errors.length === 0, this.errors);
  }

  /**
   * 是否有效
   */
  isValid(): boolean {
    return this.errors.length === 0;
  }

  /**
   * 获取错误
   */
  getErrors(): ValidationError[] {
    return this.errors;
  }

  /**
   * 重置
   */
  reset(): this {
    this.errors = [];
    return this;
  }
}

/**
 * 智能体验证
 */
export function validateAgent(data: {
  name?: string;
  type?: string;
  description?: string;
}): ValidationResult {
  const validator = new Validator();
  
  validator
    .validate(data.name, [validators.required, (v) => validators.minLength(v, 2, '名称')], 'name')
    .validate(data.type, [validators.required, (v) => validators.enum(v, ['coordinator', 'specialist', 'worker'], '类型')], 'type')
    .validate(data.description, [(v) => validators.maxLength(v || '', 500, '描述')], 'description');

  return validator.getResult();
}

/**
 * 任务验证
 */
export function validateTask(data: {
  title?: string;
  priority?: string;
  dueDate?: string;
}): ValidationResult {
  const validator = new Validator();
  
  validator
    .validate(data.title, [validators.required, (v) => validators.minLength(v, 2, '标题')], 'title')
    .validate(data.priority, [(v) => {
      if (v && !['low', 'medium', 'high', 'urgent'].includes(v)) {
        return createResult(false, [{
          field: 'priority',
          message: '优先级必须是 low, medium, high 或 urgent',
          code: 'INVALID_PRIORITY',
        }]);
      }
      return createResult(true);
    }], 'priority')
    .validate(data.dueDate, [(v) => v ? validators.date(v, '截止日期') : createResult(true)], 'dueDate');

  return validator.getResult();
}

/**
 * 知识库验证
 */
export function validateKnowledgeBase(data: {
  name?: string;
  description?: string;
}): ValidationResult {
  const validator = new Validator();
  
  validator
    .validate(data.name, [validators.required, (v) => validators.minLength(v, 2, '名称')], 'name')
    .validate(data.description, [(v) => validators.maxLength(v || '', 1000, '描述')], 'description');

  return validator.getResult();
}
