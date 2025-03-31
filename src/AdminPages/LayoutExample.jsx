import { Layout } from "antd";

const { Header, Footer, Sider, Content } = Layout;
const LayoutExample = () => (
  <Layout>
    <Header>Header</Header>

    <Sider>Sider</Sider>
    <Layout>
      <Content>Main Content</Content>
    </Layout>
    <Footer>Footer</Footer>
  </Layout>
);
export default LayoutExample;
