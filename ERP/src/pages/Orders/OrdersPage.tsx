import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiPrinter, FiPlus, FiSearch, FiLoader } from 'react-icons/fi';
import PrimaryButton from '../../components/button/PrimaryButton';
import GreenButton from '../../components/button/GreenButton';
import StatusBadge from '../../components/common/StatusBadge';
import TextInput from '../../components/input/TextInput';
import SelectInput from '../../components/input/SelectInput';
import OrderDetailModal from '../../components/modal/OrderDetailModal';
import NewOrderModal from '../../components/modal/NewOrderModal';
import { useOrdersStore, Order, OrderStatus } from '../../store/ordersStore';
import { useAuthStore } from '../../store/authStore';
import axios from '../../api/axios';

// 검색 필터 타입 정의
interface SearchFilters {
    orderId: string;
    supplier: string;
    status: string;
    dateRange: string;
}

const OrdersPage: React.FC = () => {
    // 모달 상태
    const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState<boolean>(false);
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    // 검색 필터 상태
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({
        orderId: '',
        supplier: '',
        status: '모든 상태',
        dateRange: '전체 기간',
    });

    // 페이지네이션 상태
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);

    // 로딩 및 에러 상태
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Zustand 스토어 훅
    const { orders, setOrders, updateOrderStatus } = useOrdersStore();
    const user = useAuthStore((state) => state.user);
    const isManager = user?.role === '대표';

    // 주문 데이터 가져오기 (메모이제이션)
    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 실제 API 호출 시 아래 주석 해제
            // const response = await axios.get('/api/orders');
            // setOrders(response.data);

            // 개발 환경용 샘플 데이터
            const sampleOrders: Order[] = [
                {
                    id: 1,
                    productName: 'ORD-2025-0011',
                    orderDate: '2025-03-07',
                    totalAmount: 850000,
                    status: 'pending',
                    manager: '이영희',
                    supplier: '팩토리코퍼레이션',
                    items: [],
                },
                {
                    id: 2,
                    productName: 'ORD-2025-0012',
                    orderDate: '2025-03-06',
                    totalAmount: 600000,
                    status: 'pending',
                    manager: '김철수',
                    supplier: '한국판촉물',
                    items: [],
                },
                {
                    id: 3,
                    productName: 'ORD-2025-0002',
                    orderDate: '2025-01-15',
                    totalAmount: 1875000,
                    status: 'approved',
                    manager: '박한솔',
                    supplier: '한국판촉물',
                    items: [],
                },
                {
                    id: 4,
                    productName: 'ORD-2024-0128',
                    orderDate: '2024-12-28',
                    totalAmount: 560000,
                    status: 'completed',
                    manager: '김재형',
                    supplier: '대한상사',
                    items: [],
                },
                {
                    id: 5,
                    productName: 'ORD-2025-0010',
                    orderDate: '2025-03-04',
                    totalAmount: 285000,
                    status: 'completed',
                    manager: '박지민',
                    supplier: '대한상사',
                    items: [],
                },
            ];

            setOrders(sampleOrders);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('주문 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [setOrders]);

    // 초기 데이터 로드
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // 필터링된 주문 목록 (메모이제이션)
    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // 발주번호 필터링
        if (searchFilters.orderId) {
            result = result.filter((order) =>
                order.productName.toLowerCase().includes(searchFilters.orderId.toLowerCase())
            );
        }

        // 공급업체 필터링
        if (searchFilters.supplier) {
            result = result.filter((order) =>
                order.supplier.toLowerCase().includes(searchFilters.supplier.toLowerCase())
            );
        }

        // 상태 필터링
        const statusMap: Record<string, OrderStatus> = {
            '승인 대기': 'pending',
            승인됨: 'approved',
            '입고 완료': 'completed',
        };

        if (searchFilters.status !== '모든 상태') {
            const filterStatus = statusMap[searchFilters.status];
            if (filterStatus) {
                result = result.filter((order) => order.status === filterStatus);
            }
        }

        // 날짜 필터링
        if (searchFilters.dateRange !== '전체 기간') {
            const today = new Date();
            let startDate: Date;

            switch (searchFilters.dateRange) {
                case '최근 1개월':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    break;
                case '최근 3개월':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
                    break;
                case '최근 6개월':
                    startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
                    break;
                default:
                    startDate = new Date(0);
            }

            result = result.filter((order) => {
                const orderDate = new Date(order.orderDate);
                return orderDate >= startDate && orderDate <= today;
            });
        }

        return result;
    }, [orders, searchFilters]);

    // 페이지네이션 로직
    const paginatedOrders = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        return filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    }, [filteredOrders, currentPage, itemsPerPage]);

    // 총 페이지 수 계산
    const totalPages = useMemo(() => Math.ceil(filteredOrders.length / itemsPerPage), [filteredOrders, itemsPerPage]);

    // 주문 승인 핸들러
    const handleApproveOrder = useCallback(
        async (orderId: number) => {
            try {
                // 실제 환경에서는 아래 주석을 해제하고 API 호출
                // await axios.put(`/api/orders/${orderId}/approve`);

                // 로컬 상태 업데이트
                updateOrderStatus(orderId, 'approved');

                // 성공 메시지
                alert('발주가 성공적으로 승인되었습니다.');
            } catch (error) {
                console.error('Error approving order:', error);
                alert('발주 승인 중 오류가 발생했습니다.');
            }
        },
        [updateOrderStatus]
    );

    // 주문 상세 모달 열기
    const handleOpenOrderDetail = useCallback((orderId: number) => {
        setSelectedOrderId(orderId);
        setIsOrderDetailModalOpen(true);
    }, []);

    // 주문 인쇄 핸들러
    const handlePrintOrder = useCallback((order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
            return;
        }

        // 인쇄할 HTML 내용 생성
        const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>발주서 - ${order.productName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          .info-section { display: flex; margin-bottom: 20px; }
          .info-column { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total-row { font-weight: bold; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">발 주 서</div>
        <div class="info-section">
          <div class="info-column">
            <p><strong>사업자번호:</strong> 682-88-00080</p>
            <p><strong>상호:</strong> ㈜고대미래</p>
            <p><strong>대표자:</strong> 유시진</p>
            <p><strong>주소:</strong> 서울특별시 성북구 안암로145, 고려대학교 100주년삼성기념관 103호 크림슨 스토어</p>
          </div>
          <div class="info-column">
            <p><strong>발주번호:</strong> ${order.productName}</p>
            <p><strong>발주일자:</strong> ${order.orderDate}</p>
            <p><strong>공급업체:</strong> ${order.supplier}</p>
            <p><strong>담당자:</strong> ${order.manager}</p>
          </div>
        </div>
        <p>아래와 같이 발주하오니 기일 내 필히 납품하여 주시기 바랍니다.</p>
        <p><strong>총 금액:</strong> ${order.totalAmount.toLocaleString()}원</p>
        <p><strong>상태:</strong> ${
            order.status === 'pending' ? '승인 대기' : order.status === 'approved' ? '승인됨' : '입고 완료'
        }</p>
        <button onclick="window.print()">인쇄</button>
      </body>
      </html>
    `;

        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
    }, []);

    // 페이지 변경 핸들러
    const handlePageChange = useCallback((pageNumber: number) => {
        setCurrentPage(pageNumber);
    }, []);

    // 필터 변경 핸들러
    const handleFilterChange = useCallback((key: keyof SearchFilters, value: string) => {
        setSearchFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
        setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
    }, []);

    // 새 주문 성공 핸들러
    const handleNewOrderSuccess = useCallback(
        (newOrder: Order) => {
            fetchOrders();
            setIsNewOrderModalOpen(false);
        },
        [fetchOrders]
    );

    // 상태 배지 렌더링
    const renderStatusBadge = useCallback((status: OrderStatus) => {
        switch (status) {
            case 'pending':
                return <StatusBadge text="승인 대기" theme="pending" />;
            case 'approved':
                return <StatusBadge text="승인됨" theme="approved" />;
            case 'completed':
                return <StatusBadge text="입고 완료" theme="active" />;
            default:
                return <StatusBadge text="기타" theme="neutral" />;
        }
    }, []);

    // 통화 포맷팅
    const formatCurrency = useCallback((amount: number) => {
        return `${amount.toLocaleString('ko-KR')}원`;
    }, []);

    // 로딩 상태 렌더링
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="flex items-center space-x-2">
                    <FiLoader className="animate-spin text-indigo-600" size={24} />
                    <span>주문 정보를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    // 에러 상태 렌더링
    if (error) {
        return (
            <div className="flex justify-center items-center h-full text-red-500">
                <p>{error}</p>
                <button
                    onClick={fetchOrders}
                    className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {/* 페이지 헤더 */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">발주 관리</h1>
                <GreenButton
                    text="새 발주 신청"
                    icon={<FiPlus />}
                    onClick={() => setIsNewOrderModalOpen(true)}
                    aria-label="새 발주 신청"
                />
            </div>

            {/* 검색 섹션 */}
            <div className="p-4 bg-white rounded-lg shadow-sm flex flex-col gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-64 flex flex-col gap-1">
                        <label htmlFor="order-id-search" className="text-sm font-medium text-gray-700">
                            발주번호
                        </label>
                        <TextInput
                            id="order-id-search"
                            placeholder="발주번호로 검색"
                            onChange={(value) => handleFilterChange('orderId', value)}
                            className="w-full"
                            extra={{ id: 'order-id-search' }}
                        />
                    </div>
                    <div className="w-64 flex flex-col gap-1">
                        <label htmlFor="supplier-search" className="text-sm font-medium text-gray-700">
                            공급업체
                        </label>
                        <TextInput
                            id="supplier-search"
                            placeholder="공급업체로 검색"
                            onChange={(value) => handleFilterChange('supplier', value)}
                            className="w-full"
                            extra={{ id: 'supplier-search' }}
                        />
                    </div>
                    <div className="w-64 flex flex-col gap-1">
                        <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                            상태
                        </label>
                        <SelectInput
                            defaultText="모든 상태"
                            options={['모든 상태', '승인 대기', '승인됨', '입고 완료']}
                            onChange={(value) => handleFilterChange('status', value)}
                            extra={{
                                id: 'status-filter',
                                'aria-label': '주문 상태 필터',
                            }}
                        />
                    </div>
                    <div className="w-64 flex flex-col gap-1">
                        <label htmlFor="date-range-filter" className="text-sm font-medium text-gray-700">
                            기간
                        </label>
                        <SelectInput
                            defaultText="전체 기간"
                            options={['전체 기간', '최근 1개월', '최근 3개월', '최근 6개월']}
                            onChange={(value) => handleFilterChange('dateRange', value)}
                            extra={{
                                id: 'date-range-filter',
                                'aria-label': '날짜 범위 필터',
                            }}
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <PrimaryButton
                        text="검색하기"
                        icon={<FiSearch />}
                        onClick={() => {
                            /* 필터링은 이미 useMemo로 처리됨 */
                        }}
                        aria-label="주문 검색"
                    />
                </div>
            </div>

            {/* 주문 테이블 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-5 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">발주 목록</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    발주번호
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    공급업체
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    발주일
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    총 금액
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    상태
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    담당자
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                                >
                                    상세보기
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                                >
                                    인쇄
                                </th>
                                {isManager && (
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                                    >
                                        승인
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => {
                                    const isPending = order.status === 'pending';
                                    return (
                                        <tr
                                            key={order.id}
                                            className={`${
                                                isPending ? 'bg-yellow-50' : ''
                                            } hover:bg-gray-50 transition-colors`}
                                        >
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                {order.productName}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{order.supplier}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{order.orderDate}</td>
                                            <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(order.totalAmount)}
                                            </td>
                                            <td className="px-4 py-3.5">{renderStatusBadge(order.status)}</td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{order.manager}</td>
                                            <td className="px-7 py-3.5">
                                                <button
                                                    onClick={() => handleOpenOrderDetail(order.id)}
                                                    className="px-3 py-1 bg-indigo-600 rounded-md text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                                                    aria-label={`${order.productName} 상세보기`}
                                                >
                                                    상세보기
                                                </button>
                                            </td>
                                            <td className="px-6 py-3">
                                                <button
                                                    onClick={() => handlePrintOrder(order)}
                                                    className="p-2 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                                                    aria-label={`${order.productName} 인쇄`}
                                                >
                                                    <FiPrinter className="w-4 h-4" />
                                                </button>
                                            </td>
                                            {isManager && (
                                                <td className="px-6 py-3.5 text-center">
                                                    {isPending ? (
                                                        <button
                                                            onClick={() => handleApproveOrder(order.id)}
                                                            className="px-3 py-1 bg-green-600 rounded text-xs font-medium text-white flex items-center justify-center hover:bg-green-700 transition-colors"
                                                            aria-label={`${order.productName} 승인`}
                                                        >
                                                            <span className="w-3 h-3 mr-1 relative">
                                                                <span className="absolute inset-0 bg-white rounded-full transform scale-75"></span>
                                                            </span>
                                                            승인
                                                        </button>
                                                    ) : (
                                                        <div className="px-5 text-green-600 text-xs font-medium flex items-center justify-center">
                                                            <span className="w-4 h-4 mr-1 relative">
                                                                <span className="absolute inset-0 bg-green-600 rounded-full transform scale-75"></span>
                                                            </span>
                                                            완료
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={isManager ? 9 : 8}
                                        className="px-4 py-8 text-sm text-gray-500 text-center"
                                    >
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 페이지네이션 */}
                <div className="px-4 py-3 bg-white border-t border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700">항목당 표시</span>
                        <select
                            className="mx-2 py-1 px-2 bg-gray-100 border border-gray-300 rounded-md text-sm"
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            aria-label="페이지당 항목 수 선택"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-gray-700">/ 페이지</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center justify-center rounded-md w-10 h-9 text-gray-500 border border-gray-200 hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                            aria-label="이전 페이지"
                        >
                            &lt;
                        </button>

                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`relative inline-flex items-center justify-center w-10 h-9 rounded-md ${
                                        currentPage === pageNum
                                            ? 'text-indigo-600 bg-indigo-50 border border-indigo-600'
                                            : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                                    } focus:outline-none`}
                                    aria-label={`${pageNum}페이지로 이동`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="relative inline-flex items-center justify-center rounded-md w-10 h-9 text-gray-500 border border-gray-200 hover:bg-gray-50 focus:outline-none disabled:opacity-50"
                            aria-label="다음 페이지"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* 주문 상세 모달 */}
            {isOrderDetailModalOpen && selectedOrderId && (
                <OrderDetailModal
                    orderId={selectedOrderId}
                    isOpen={isOrderDetailModalOpen}
                    onClose={() => setIsOrderDetailModalOpen(false)}
                    isManager={isManager}
                    onApproveSuccess={() => fetchOrders()}
                />
            )}

            {/* 새 주문 모달 */}
            {isNewOrderModalOpen && (
                <NewOrderModal
                    isOpen={isNewOrderModalOpen}
                    onClose={() => setIsNewOrderModalOpen(false)}
                    onSuccess={handleNewOrderSuccess}
                />
            )}
        </div>
    );
};

export default OrdersPage;
