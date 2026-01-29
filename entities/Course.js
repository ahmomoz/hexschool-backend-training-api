const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "course",
  tableName: "COURSE",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    experience_years: {
      type: "integer",
      nullable: false,
    },
    description: {
      type: "text",
      nullable: false,
    },
    profile_image_url: {
      type: "varchar",
      length: 2048,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
    update_at: {
      type: "timestamp",
      updateDate: true,
      nullable: false,
    },
  },
  // 定義關聯處
  relations: {
    User: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "courses_user_id_fk",
      },
    },
    Skill: {
      target: "Skill",
      type: "many-to-one",
      joinColumn: {
        name: "skill_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "courses_skill_id_fk",
      },
    },
  },
});
