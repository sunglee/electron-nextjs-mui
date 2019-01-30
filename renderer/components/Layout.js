import styled from "styled-components";

const Inner = styled.div`
  padding: 0.75rem;
  height: 100vh;
  overflow-y: scroll;
`;

const Layout = props => <Inner>{props.children}</Inner>;

export default Layout;
