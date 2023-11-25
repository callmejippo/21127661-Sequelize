const controller = {};
const models = require("../models");
const limit = 2;

const preProcessData = function (datas) {
  return datas.map((data) => data.dataValues);
};

controller.showList = async (req, res) => {
  res.locals.categories = await models.Category.findAll({
    attributes: ["id", "name"],
    include: [{ model: models.Blog }],
  });
  res.locals.tags = await models.Tag.findAll({
    attributes: ["id", "name"],
  });

  let page = Number(req.query.page) || 1;
  let category = req.query.category;
  let tag = req.query.tag;
  let keyword = req.query.keyword;

  if (category) {
    let { count, rows: blogs } = await models.Blog.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
      attributes: [
        "id",
        "title",
        "imagePath",
        "summary",
        "createdAt",
        "categoryId",
        [
          models.Sequelize.literal(
            '(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
          ),
          "comments",
        ],
      ],
      where: { categoryId: category },
    });
    res.render("index", {
      blogs: preProcessData(blogs),
      pagination: {
        page: page,
        limit: limit,
        totalRows: count,
        queryParams: { category: category },
      },
    });
  } else if (tag) {
    let { count, rows: blogs } = await models.Blog.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
      attributes: [
        "id",
        "title",
        "imagePath",
        "summary",
        "createdAt",
        "categoryId",
        [
          models.Sequelize.literal(
            '(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
          ),
          "comments",
        ],
      ],
      include: [
        {
          model: models.Tag,
          where: { id: tag },
        },
      ],
    });
    res.render("index", {
      blogs: preProcessData(blogs),
      pagination: {
        page: page,
        limit: limit,
        totalRows: count,
        queryParams: { tag: tag },
      },
    });
  } else if (keyword) {
    let { count, rows: blogs } = await models.Blog.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
      attributes: [
        "id",
        "title",
        "imagePath",
        "summary",
        "createdAt",
        "categoryId",
        [
          models.Sequelize.literal(
            '(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
          ),
          "comments",
        ],
      ],
      where: { title: { [models.Sequelize.Op.iLike]: `%${keyword}%` } },
    });
    if (count === 0) {
      res.render("notFound", {
        blogs: preProcessData(blogs),
        pagination: {
          page: page,
          limit: limit,
          totalRows: count,
        },
      });
    } else {
      res.render("index", {
        blogs: preProcessData(blogs),
        pagination: {
          page: page,
          limit: limit,
          totalRows: count,
        },
      });
    }
  } else {
    let { count, rows: blogs } = await models.Blog.findAndCountAll({
      limit: limit,
      offset: (page - 1) * limit,
      attributes: [
        "id",
        "title",
        "imagePath",
        "summary",
        "createdAt",
        "categoryId",
        [
          models.Sequelize.literal(
            '(SELECT COUNT(*) FROM "Comments" WHERE "Comments"."blogId" = "Blog"."id")'
          ),
          "comments",
        ],
      ],
    });
    console.log(limit);
    console.log(page);
    console.log(count);
    res.render("index", {
      blogs: preProcessData(blogs),
      pagination: {
        page: page,
        limit: limit,
        totalRows: count,
      },
    });
  }
};

controller.showDetails = async (req, res) => {
  let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
  res.locals.blog = await models.Blog.findOne({
    attributes: ["id", "title", "description", "createdAt"],
    where: { id: id },
    include: [
      { model: models.Category },
      { model: models.User },
      { model: models.Tag },
      { model: models.Comment },
    ],
  });
  res.locals.categories = await models.Category.findAll({
    attributes: ["id", "name"],
    include: [{ model: models.Blog }],
  });
  res.locals.tags = await models.Tag.findAll({
    attributes: ["name"],
  });
  res.render("details");
};

controller.showCategory = async (req, res) => {
  let category = req.params.id;
  res.locals.categories = await models.Category.findAll({
    attributes: ["id", "name"],
    include: [{ model: models.Blog }],
  });
  res.locals.tags = await models.Tag.findAll({
    attributes: ["id", "name"],
  });

  res.locals.blogs = await models.Blog.findAll({
    attributes: [
      "id",
      "title",
      "imagePath",
      "summary",
      "createdAt",
      "categoryId",
    ],
    include: [{ model: models.Comment }],
    where: { categoryId: category },
  });
  res.render("index");
};

controller.showTag = async (req, res) => {
  let tag = req.params.id;
  res.locals.categories = await models.Category.findAll({
    attributes: ["id", "name"],
    include: [{ model: models.Blog }],
  });
  res.locals.tags = await models.Tag.findAll({
    attributes: ["id", "name"],
  });

  res.locals.blogs = await models.Blog.findAll({
    attributes: ["id", "title", "imagePath", "summary", "createdAt"],
    include: [
      { model: models.Comment },
      { model: models.Tag, where: { id: tag } },
    ],
  });
  res.render("index");
};

controller.showSearchResult = async (req, res) => {
  let keyword = req.query.keyword;
  console.log(keyword);

  res.locals.categories = await models.Category.findAll({
    attributes: ["id", "name"],
    include: [{ model: models.Blog }],
  });
  res.locals.tags = await models.Tag.findAll({
    attributes: ["id", "name"],
  });

  res.locals.blogs = await models.Blog.findAll({
    attributes: ["id", "title", "imagePath", "summary", "createdAt"],
    include: [{ model: models.Comment }],
    where: {
      title: { [models.Sequelize.Op.like]: `%${keyword}%` },
    },
  });

  res.render("index");
};

module.exports = controller;
