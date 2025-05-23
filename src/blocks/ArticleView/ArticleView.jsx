import React from "react";
import {
  Block,
  Grid,
  GridItem,
  Icon,
  Label,
  Like,
  Markdown,
} from "@USupport-components-library/src";
import propTypes from "prop-types";

import "./article-view.scss";

/**
 * ArticleView
 *
 * ArticleView block
 *
 * @return {jsx}
 */
export const ArticleView = ({ articleData, t }) => {
  const creator = articleData.creator ? articleData.creator : null;

  return (
    <Block classes="article-view">
      <Grid classes="article-view__main-grid">
        <GridItem md={8} lg={12} classes="article-view__title-item">
          <h3>{articleData.title}</h3>
        </GridItem>

        <GridItem md={8} lg={12} classes="article-view__details-item">
          {creator && <p className={"small-text"}>{t("by", { creator })}</p>}

          <Icon name={"time"} size="sm" />
          <p className={"small-text"}> {articleData.readingTime} min read</p>

          <div className="article-view__details-item__category">
            <p className="small-text ">{articleData.categoryName}</p>
          </div>
        </GridItem>

        <GridItem xs={3} md={6} lg={8} classes="article-view__labels-item">
          {articleData.labels.map((label, index) => {
            return (
              <Label
                classes={"article-view__label"}
                text={label.name}
                key={index}
              />
            );
          })}
        </GridItem>

        <GridItem xs={1} md={2} lg={4} classes="article-view__like-item">
          <Like
            likes={articleData.contentRating?.likes || 0}
            isLiked={false}
            dislikes={articleData.contentRating?.dislikes || 0}
            isDisliked={false}
          />
        </GridItem>

        <GridItem md={8} lg={12}>
          <img
            className="article-view__image-item"
            src={
              articleData.imageMedium ||
              articleData.imageLarge ||
              articleData.imageSmall ||
              articleData.imageThumbnail ||
              "https://picsum.photos/300/400"
            }
            alt=""
          />
        </GridItem>

        <GridItem md={8} lg={12} classes="article-view__body-item">
          <Markdown markDownText={articleData.body} className={"text"} />
        </GridItem>
      </Grid>
    </Block>
  );
};

ArticleView.propTypes = {
  /**
   * Article data
   * */
  articleData: propTypes.shape({
    title: propTypes.string,
    creator: propTypes.string,
    readingTime: propTypes.string,
    body: propTypes.string,
    labels: propTypes.arrayOf(
      propTypes.shape({
        name: propTypes.string,
      })
    ),
  }).isRequired,
};

ArticleView.defaultProps = {
  articleData: {
    labels: [],
    title: "",
    creator: "",
    readingTime: 0,
    body: "",
  },
};
