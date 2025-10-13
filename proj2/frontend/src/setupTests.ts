// src/setupTests.ts
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// 将 jest-dom 的匹配器扩展到 expect 上
expect.extend(matchers);

// 在每个测试用例运行后，清理 DOM 环境
afterEach(() => {
  cleanup();
});