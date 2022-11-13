import React, { useState } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useTranslation } from "react-i18next";
import {
  Block,
  Grid,
  GridItem,
  Icon,
  Avatar,
  Box,
} from "@USupport-components-library/src";

import "./provider-overview.scss";

/**
 * ProviderOverview
 *
 * ProviderOverview block
 *
 * @return {jsx}
 */
export const ProviderOverview = ({ withMenuIcon = true }) => {
  const { t } = useTranslation("provider-overview");

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const provider = {
    name: "Joanna",
    patronym: "Doe",
    surname: "Doe",
    phone: "359 7125 12522",
    email: "jdoe@mail.com",
    specializations: ["Psychiatrist", "Neuropsychiatrist", "Psychotherapist"],
    price: 50,
    earliestAvailable: "from 10:30 to 11:30 on 09.09.22",
    languages: ["English", "Spanish"],
    education: ["Bechelor degree", "Masters degree"],
    workWith: ["Work category1", "work category 2"],
    consultations: 74,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Varius euismod.",
  };

  const allOptionsToString = (option) => {
    return provider[option].join(", ");
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = () => {
    console.log("Edit");
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    console.log("Delete");
    setIsMenuOpen(false);
  };

  return (
    <Block classes="provider-profile">
      <Grid md={8} lg={12} classes="provider-profile__grid">
        <GridItem md={8} lg={12}>
          <div className="provider-profile__header">
            <div className="provider-profile__header__provider-container">
              <Avatar classes="provider-profile__header__provider-container__avatar" />
              <div className="provider-profile__header__provider-container__text-container">
                <h4>
                  {provider.name} {provider.patronym ? provider.patronym : ""}{" "}
                  {provider.surname}
                </h4>
                <p className="small-text">
                  {allOptionsToString("specializations")}
                </p>
              </div>
              {isMenuOpen && (
                <OutsideClickHandler
                  onOutsideClick={() => setIsMenuOpen(false)}
                >
                  <Box classes="provider-profile__header__menu">
                    <div
                      className="provider-profile__header__menu__button"
                      onClick={handleEdit}
                    >
                      <Icon name="edit" color="#20809E" />
                      <p className="text provider-profile__header__menu__button__text-edit">
                        Edit
                      </p>
                    </div>
                    <div
                      className="provider-profile__header__menu__button"
                      onClick={handleDelete}
                    >
                      <Icon name="delete" color="#EB5757" />
                      <p className="text provider-profile__header__menu__button__text-delete">
                        Delete
                      </p>
                    </div>
                  </Box>
                </OutsideClickHandler>
              )}
            </div>
            {withMenuIcon && <Icon name="menu" onClick={handleMenuClick} />}
          </div>
        </GridItem>
        <GridItem md={8} lg={12} classes="provider-profile__grid__item">
          <div className="provider-profile__information-container-with-icon">
            <Icon
              name="call"
              size="md"
              color="#66768D"
              classes="provider-profile__information-container-with-icon__icon"
            />
            <p className="small-text">{provider.phone}</p>
          </div>
          <div className="provider-profile__information-container-with-icon">
            <Icon
              name="mail-admin"
              size="md"
              color="#66768D"
              classes="provider-profile__information-container-with-icon__icon"
            />
            <p className="small-text">{provider.email}</p>
          </div>
          <div className="provider-profile__information-container-with-icon">
            <Icon
              name="dollar"
              size="md"
              color="#66768D"
              classes="provider-profile__information-container-with-icon__icon"
            />
            <p className="small-text">
              {provider.price}$ for 1 hour consultation
            </p>
          </div>
          <div className="provider-profile__information-container">
            <p className="small-text provider-profile__information-container__heading">
              {t("earliest_spot_label")}
            </p>
            <p className="small-text provider-profile__information-container__text">
              {provider.earliestAvailable}
            </p>
          </div>
          <div className="provider-profile__information-container">
            <p className="small-text provider-profile__information-container__heading">
              {t("languages_label")}
            </p>
            <p className="small-text provider-profile__information-container__text">
              {allOptionsToString("languages")}
            </p>
          </div>
          <div className="provider-profile__information-container">
            <p className="small-text provider-profile__information-container__heading">
              {t("education_label")}
            </p>
            <p className="small-text provider-profile__information-container__text">
              {allOptionsToString("education")}
            </p>
          </div>
          <div className="provider-profile__information-container">
            <p className="small-text provider-profile__information-container__heading">
              {t("work_with_label")}
            </p>
            <p className="small-text provider-profile__information-container__text">
              {allOptionsToString("workWith")}
            </p>
          </div>
          <div className="provider-profile__information-container">
            <p className="small-text provider-profile__information-container__heading">
              {t("done_consultations_label")}
            </p>
            <p className="small-text provider-profile__information-container__text">
              {provider.consultations} consultations
            </p>
          </div>
          <div className="provider-profile__information-container">
            <p className="small-text provider-profile__information-container__heading">
              {t("description_label")}
            </p>
            <p className="small-text provider-profile__information-container__text">
              {provider.description}
            </p>
          </div>
        </GridItem>
      </Grid>
    </Block>
  );
};
