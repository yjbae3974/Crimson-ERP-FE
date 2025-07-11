import api from './axios';

// 직원 목록 조회
export const fetchEmployees = () => api.get('/hr/employees/');

// 직원 상세 조회
export const fetchEmployee = (employeeId: number) => api.get(`/hr/employees/${employeeId}/`);

// 직원 정보 수정 (PUT)
export const updateEmployee = (employeeId: number, data: EmployeeUpdateData) =>
    api.put(`/hr/employees/${employeeId}/`, data);

// 직원 정보 부분 수정 (PATCH)
export const patchEmployee = (employeeId: number, data: EmployeePatchData) =>
    api.patch(`/hr/employees/${employeeId}/`, data);

// 직원 퇴사 처리 (is_active를 false로 설정)
export const terminateEmployee = (employeeId: number) =>
    api.patch(`/hr/employees/${employeeId}/`, { is_active: false });

// 대시보드 데이터 조회
export const fetchDashboardData = () => api.get('/');

// 직원 승인/거절
export const approveEmployee = (username: string, status: 'approved' | 'denied') =>
    api.post('/authentication/approve/', { username, status });

// 백엔드 API 응답에 맞는 Employee 타입
export interface Employee {
    id: number;
    username: string;
    email: string;
    role: string;
    status: 'APPROVED' | 'DENIED';
    contact: string;
    status: string;
    first_name: string;
}

// 프론트엔드에서 사용할 매핑된 Employee 타입
export interface MappedEmployee {
    id: number;
    name: string;
    position: string;
    department: string;
    email: string;
    phone: string;
    status: 'APPROVED' | 'DENIED';
    hire_date: string;
    created_at: string;
    updated_at: string;
}

export interface EmployeeUpdateData {
    role?: string;
    email?: string;
    contact?: string;
    status?: 'APPROVED' | 'DENIED';
}

// PATCH 엔드포인트용 데이터 타입
export interface EmployeePatchData {
    email?: string;
    contact?: string;
    is_active?: boolean;
}

export interface DashboardData {
    low_stock_items: Array<{
        id: number;
        name: string;
        current_stock: number;
        minimum_stock: number;
    }>;
    recent_orders: Array<{
        id: number;
        product_name: string;
        quantity: number;
        order_date: string;
        status: string;
    }>;
}
