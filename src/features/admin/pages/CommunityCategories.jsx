import { useCallback, useEffect, useState } from "react";
import {
  App,
  Button,
  Col,
  ConfigProvider,
  Empty,
  Form,
  Grid,
  Input,
  Modal,
  Popconfirm,
  Row,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AdminPanelLayout from "../components/AdminPanelLayout";
import {
  createCommunityCategory,
  deleteCommunityCategory,
  getCommunityCategories,
  updateCommunityCategory,
  updateCommunityCategoryStatus,
} from "../api/communityCategoriesApi";
import "./CommunityCategories.css";

const { Paragraph, Text, Title } = Typography;
const { useBreakpoint } = Grid;

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback;

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

function CategoriesContent() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusId, setStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCommunityCategories();
      setCategories(
        Array.isArray(response.data?.data) ? response.data.data : [],
      );
    } catch (error) {
      setCategories([]);
      message.error(
        getErrorMessage(error, "Unable to load community categories"),
      );
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({ categoryName: category.categoryName });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const saveCategory = async ({ categoryName }) => {
    const trimmedName = categoryName.trim();
    const duplicate = categories.some(
      (category) =>
        category.id !== editingCategory?.id &&
        category.categoryName?.trim().toLowerCase() ===
          trimmedName.toLowerCase(),
    );
    if (duplicate) {
      form.setFields([
        { name: "categoryName", errors: ["This category already exists"] },
      ]);
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCommunityCategory(
          editingCategory.id,
          trimmedName,
          editingCategory.version,
        );
        message.success("Category updated successfully");
      } else {
        await createCommunityCategory(trimmedName);
        message.success("Category created successfully");
      }
      setModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
      await loadCategories();
    } catch (error) {
      const fallback = editingCategory
        ? "Unable to update category"
        : "Unable to create category";
      message.error(getErrorMessage(error, fallback));
      if (error.response?.status === 409) await loadCategories();
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (category) => {
    const nextActive = !category.active;
    setStatusId(category.id);
    try {
      const response = await updateCommunityCategoryStatus(
        category.id,
        nextActive,
      );
      const updated = response.data?.data;
      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? updated || { ...item, active: nextActive }
            : item,
        ),
      );
      message.success(
        `Category ${nextActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (error) {
      message.error(
        getErrorMessage(error, "Unable to update category status"),
      );
    } finally {
      setStatusId(null);
    }
  };

  const removeCategory = async (category) => {
    setDeletingId(category.id);
    try {
      await deleteCommunityCategory(category.id);
      const remainingCount = Math.max(0, categories.length - 1);
      const lastPage = Math.max(1, Math.ceil(remainingCount / pageSize));
      setCurrentPage((page) => Math.min(page, lastPage));
      message.success("Category deleted successfully");
      await loadCategories();
    } catch (error) {
      message.error(getErrorMessage(error, "Unable to delete category"));
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 80,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Category",
      dataIndex: "categoryName",
      key: "categoryName",
      align: "center",
      render: (name) => (
        <Space size={12}>
         
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "active",
      
      align: "center",
      render: (active) => (
        <Tag
          color={active ? "success" : "default"}
          // icon={active ? <CheckCircleOutlined /> : <StopOutlined />}
        >
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
     
      align: "center",
     
      render: (date) => <Text type="secondary">{formatDate(date)}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
     
      align: "center",
      render: (_, category) => (
        <Space size={screens.xs ? 4 : 10}>
          <Button
            size="small"
            icon={<EditOutlined />}
            style={{ borderColor: "#008cba", color: "#008cba" }}
            aria-label={`Edit ${category.categoryName}`}
            onClick={() => openEditModal(category)}
          >
            Edit
          </Button>
          <Popconfirm
            title={`${category.active ? "Deactivate" : "Activate"} category?`}
            description={
              category.active
                ? "Users may no longer be able to select this category."
                : "This category will become available to users."
            }
            okText={category.active ? "Deactivate" : "Activate"}
            cancelText="Cancel"
            onConfirm={() => changeStatus(category)}
          >
            <Button
              size="small"
              loading={statusId === category.id}
              className={
                category.active
                  ? "community-status-button active"
                  : "community-status-button inactive"
              }
            >
              {category.active ? "Active" : "Inactive"}
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Delete category?"
            description={`"${category.categoryName}" will be permanently removed.`}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
            onConfirm={() => removeCategory(category)}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deletingId === category.id}
              aria-label={`Delete ${category.categoryName}`}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <main className="community-categories-page mx-auto max-w-7xl rounded-2xl bg-white p-3 sm:p-5 lg:p-6">
      <Row
        gutter={12}
        align="middle"
        justify="space-between"
        wrap={false}
        className="community-category-page-header"
      >
        <Col flex="auto">
          <Title level={3} className="!mb-1 !text-slate-900">
            Community Categories
          </Title>
          <Paragraph type="secondary" className="!mb-0">
            Create, rename, and control the categories available in the
            community.
          </Paragraph>
        </Col>
        <Col flex="none">
          <Button
            type="primary"
            size="middle"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Add Category
          </Button>
        </Col>
      </Row>

      <div className="community-category-table-wrap">
        {loading && categories.length === 0 ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            dataSource={categories}
            loading={loading}
            scroll={{ x: true }}
            onChange={(pagination) => {
              setCurrentPage(pagination.current || 1);
              setPageSize(pagination.pageSize || 10);
            }}
            pagination={{
              current: currentPage,
              pageSize,
              showSizeChanger: categories.length > 10,
              pageSizeOptions: ["10", "20", "50"],
              showTotal: (total) =>
                `${total} ${total === 1 ? "category" : "categories"}`,
            }}
            locale={{
              emptyText: (
                <Empty
                  description="No community categories yet"
                >
                  <Button type="primary" onClick={openCreateModal}>
                    Create First Category
                  </Button>
                </Empty>
              ),
            }}
          />
        )}
      </div>

      <Modal
        title={editingCategory ? "Edit category" : "Add category"}
        open={modalOpen}
        onCancel={closeModal}
        okText={editingCategory ? "Save changes" : "Create category"}
        confirmLoading={saving}
        okButtonProps={{ htmlType: "submit", form: "community-category-form" }}
        destroyOnClose
      >
        <Paragraph type="secondary">
          {editingCategory
            ? "Update the category name shown to community users."
            : "Enter a clear name so users can quickly understand the topic."}
        </Paragraph>
        <Form
          id="community-category-form"
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={saveCategory}
        >
          <Form.Item
            name="categoryName"
            label="Category name"
            validateTrigger={["onBlur", "onSubmit"]}
            rules={[
              { required: true, whitespace: true, message: "Enter a category name" },
              { min: 2, message: "Use at least 2 characters" },
              { max: 150, message: "Use 150 characters or fewer" },
            ]}
          >
            <Input
              autoFocus
              size="large"
              maxLength={150}
              showCount
              placeholder="For example: Artificial Intelligence"
            />
          </Form.Item>
        </Form>
      </Modal>
    </main>
  );
}

export default function CommunityCategories() {
  return (
    <AdminPanelLayout>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#008cba",
            colorInfo: "#008cba",
            colorSuccess: "#1ab394",
            borderRadius: 10,
            controlHeight: 40,
          },
          components: {
            Button: { fontWeight: 600 },
            Switch: { colorPrimary: "#1ab394", colorPrimaryHover: "#15977d" },
          },
        }}
      >
        <App>
          <CategoriesContent />
        </App>
      </ConfigProvider>
    </AdminPanelLayout>
  );
}
