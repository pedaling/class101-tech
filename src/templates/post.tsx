import { Body2, Col, Grid, Row, TextStyles, Colors } from '@class101/ui';
import { RouteComponentProps } from '@reach/router';
import { graphql, Link } from 'gatsby';
import parse, { HTMLReactParserOptions } from 'html-react-parser';
import _ from 'lodash';
import React from 'react';
import styled from 'styled-components';

import Bio from '../components/Bio';
import Comments from '../components/Comments';
import Img from '../components/Img';
import Layout from '../components/Layout';
import LinkTag from '../components/LinkTag';
import RecruitingCard from '../components/RecruitingCard';
import SEO from '../components/SEO';
import ShareButtons from '../components/ShareButtons';
import { MarkdownRemark, Site, User } from '../graphql-types';
import markdown from '../utils/markdown';
import getPostPath from '../utils/getPostPath';

interface Props {
  data: {
    site: Site;
    markdownRemark: MarkdownRemark;
  };
  pageContext: {
    user: User;
    previous: MarkdownRemark;
    next: MarkdownRemark;
  };
}

const options: HTMLReactParserOptions = {
  replace: domEl => {
    if (!domEl.parent || !domEl.parent.name) {
      return;
    }

    const tagName = domEl.parent.name;

    if (
      tagName === 'h1' ||
      tagName === 'h2' ||
      tagName === 'h3' ||
      tagName === 'h4' ||
      tagName === 'h5' ||
      tagName === 'h6'
    ) {
      const innerText = domEl.data as string;

      return React.createElement('span', { id: encodeURI(_.kebabCase(innerText)) }, innerText);
    }

    return;
  },
};

const PostTemplate: React.SFC<Props & RouteComponentProps> = props => {
  const {
    pageContext: { previous, next, user },
    data: {
      site: {
        siteMetadata: { siteUrl },
      },
      markdownRemark: {
        tableOfContents,
        excerpt,
        html,
        fields: { slug },
        frontmatter: { title, date, description, thumbnail, author, tags },
      },
    },
    location: { href, pathname },
  } = props;

  return (
    <Layout>
      <SEO
        title={title}
        description={`${description} ${excerpt}`}
        thumbnail={thumbnail}
        author={author}
        pathname={pathname}
      />
      <Grid>
        <Row>
          <Col>
            <PostContainer>
              <PostHeader>
                <ShareButtons url={href} />

                {tags.map((tag: string) => (
                  <LinkTag fieldValue={tag} key={tag} />
                ))}
                <PostTitle>{title}</PostTitle>

                <PostDate>{date}</PostDate>
              </PostHeader>

              <PostTOC>{parse(tableOfContents.split(slug).join(''), options)}</PostTOC>

              <PostBody className="markdown-body">{parse(html, options)}</PostBody>

              {tags.includes('recruiting') && <RecruitingCard />}

              <PostFooter>
                {previous && (
                  <PostNavigator to={getPostPath(previous.frontmatter.date, previous.frontmatter.author)} rel="prev">
                    <PostNavigatorTitle>
                      <span>이전 글</span>
                      <br />
                      <b>{previous.frontmatter.title}</b>
                    </PostNavigatorTitle>
                    <Img src={previous.frontmatter.thumbnail} />
                  </PostNavigator>
                )}
                {next && (
                  <PostNavigator to={getPostPath(next.frontmatter.date, next.frontmatter.author)} rel="next">
                    <PostNavigatorTitle>
                      <span>다음 글</span>
                      <br />
                      <b>{next.frontmatter.title}</b>
                    </PostNavigatorTitle>
                    <Img src={next.frontmatter.thumbnail} />
                  </PostNavigator>
                )}
              </PostFooter>
            </PostContainer>
          </Col>
        </Row>
        <Row>
          <Col>
            <Bio user={user} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Comments title={title} siteUrl={siteUrl} slug={pathname} />
          </Col>
        </Row>
      </Grid>
    </Layout>
  );
};

export default PostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
        siteUrl
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      tableOfContents
      excerpt(pruneLength: 300, truncate: true)
      html
      fields {
        slug
      }
      frontmatter {
        title
        thumbnail
        date(formatString: "YYYY-MM-DD")
        description
        author
        tags
      }
    }
  }
`;

const PostContainer = styled.div`
  background: white;
  border-radius: 3px;
  margin: 0 auto;
  ${markdown};
`;

const PostHeader = styled.div`
  padding: 32px 8px;
  text-align: center;
`;

const PostTitle = styled.h1`
  ${TextStyles.headline2}
  margin: 16px 0;
`;

const PostDate = styled(Body2)`
  margin-bottom: 16px;
`;

const PostTOC = styled.div`
  ${TextStyles.body2};
  margin: 16px 0;
  padding: 16px 0;
  line-height: 26px;
  border: ${Colors.gray400} solid 1px;
  a {
    color: inherit;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  ul,
  ol {
    margin: 0 0 0 8px;
    list-style-type: decimal;
  }
  p {
    margin: 0;
  }
`;

const PostBody = styled.div`
  margin: 16px 0;
`;

const PostFooter = styled.div`
  display: flex;
  @media (max-width: 425px) {
    flex-direction: column;
  }
`;

const PostNavigator = styled(Link)`
  display: block;
  position: relative;
  flex: 1;
  background: black;
  opacity: 0.99;
  img {
    z-index: 1;
    opacity: 0.5;
  }
  &:hover {
    img {
      transition: transform 0.3s ease-in;
      transform: scale(1.025);
    }
  }
`;

const PostNavigatorTitle = styled.p`
  font-size: 19px;
  position: absolute;
  top: 50%;
  margin-top: -39px;
  text-align: center;
  width: 100%;
  font-weight: 800;
  color: white;
  z-index: 2;
  span {
    font-weight: 400;
  }
  b {
    font-weight: 600;
  }
`;
