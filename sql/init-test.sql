-- Malahot 测试环境数据库初始化
-- 复用同一个 MySQL 实例，使用不同的数据库名

CREATE DATABASE IF NOT EXISTS `malahot_test` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON `malahot_test`.* TO 'malahot'@'%';
FLUSH PRIVILEGES;

USE malahot_test;

-- 以下表结构与正式环境一致

CREATE TABLE IF NOT EXISTS `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `role` VARCHAR(20) NOT NULL DEFAULT 'PLAYER' COMMENT '角色: ADMIN/PLAYER',
    `status` TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `score` INT NOT NULL DEFAULT 0 COMMENT '个人积分',
    `matches_played` INT NOT NULL DEFAULT 0 COMMENT '总场次',
    `wins` INT NOT NULL DEFAULT 0 COMMENT '总胜场',
    `rating` VARCHAR(10) NOT NULL DEFAULT 'D' COMMENT '战力评级: SS/S/A/B/C/D/E/F',
    `champion_count` INT NOT NULL DEFAULT 0 COMMENT '冠军次数',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_phone` (`phone`),
    KEY `idx_role` (`role`),
    KEY `idx_score` (`score` DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `competition` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(100) NOT NULL COMMENT '赛事名称',
    `game_type` VARCHAR(50) NOT NULL COMMENT '游戏类型',
    `description` TEXT COMMENT '赛事描述',
    `rules` TEXT COMMENT '赛事规则',
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
    `max_teams` INT NOT NULL DEFAULT 16 COMMENT '最大参赛队伍数',
    `team_size` INT NOT NULL DEFAULT 5 COMMENT '每队人数',
    `format` VARCHAR(20) NOT NULL DEFAULT 'SINGLE_ELIMINATION' COMMENT '赛制',
    `registration_start` DATETIME NOT NULL COMMENT '报名开始时间',
    `registration_end` DATETIME NOT NULL COMMENT '报名截止时间',
    `competition_start` DATETIME DEFAULT NULL COMMENT '比赛开始时间',
    `status` VARCHAR(20) NOT NULL DEFAULT 'DRAFT' COMMENT '状态',
    `created_by` BIGINT NOT NULL COMMENT '创建人ID',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_created_by` (`created_by`),
    KEY `idx_game_type` (`game_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='赛事表';

CREATE TABLE IF NOT EXISTS `team` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL COMMENT '战队名称',
    `logo` VARCHAR(255) DEFAULT NULL COMMENT '战队Logo URL',
    `captain_id` BIGINT NOT NULL COMMENT '队长用户ID',
    `competition_id` BIGINT NOT NULL COMMENT '所属赛事ID',
    `invite_code` VARCHAR(20) NOT NULL COMMENT '邀请码',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_invite_code` (`invite_code`),
    UNIQUE KEY `uk_name_competition` (`name`, `competition_id`),
    KEY `idx_competition_id` (`competition_id`),
    KEY `idx_captain_id` (`captain_id`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='战队表';

CREATE TABLE IF NOT EXISTS `team_member` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `team_id` BIGINT NOT NULL COMMENT '战队ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `role` VARCHAR(20) NOT NULL DEFAULT 'MEMBER' COMMENT '队内角色',
    `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_team_user` (`team_id`, `user_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='队员表';

CREATE TABLE IF NOT EXISTS `match_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `competition_id` BIGINT NOT NULL COMMENT '赛事ID',
    `round` INT NOT NULL COMMENT '轮次',
    `match_order` INT NOT NULL COMMENT '场次序号',
    `team_a_id` BIGINT DEFAULT NULL COMMENT '队伍A ID',
    `team_b_id` BIGINT DEFAULT NULL COMMENT '队伍B ID',
    `score_a` INT DEFAULT NULL COMMENT '队伍A得分',
    `score_b` INT DEFAULT NULL COMMENT '队伍B得分',
    `winner_id` BIGINT DEFAULT NULL COMMENT '获胜队伍ID',
    `scheduled_at` DATETIME DEFAULT NULL COMMENT '计划比赛时间',
    `status` VARCHAR(20) NOT NULL DEFAULT 'PENDING' COMMENT '状态',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_competition_round` (`competition_id`, `round`),
    KEY `idx_team_a` (`team_a_id`),
    KEY `idx_team_b` (`team_b_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对阵记录表';

CREATE TABLE IF NOT EXISTS `ranking` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `competition_id` BIGINT NOT NULL COMMENT '赛事ID',
    `team_id` BIGINT NOT NULL COMMENT '战队ID',
    `wins` INT NOT NULL DEFAULT 0 COMMENT '胜场',
    `losses` INT NOT NULL DEFAULT 0 COMMENT '负场',
    `points` INT NOT NULL DEFAULT 0 COMMENT '积分',
    `rank_position` INT DEFAULT NULL COMMENT '排名',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_competition_team` (`competition_id`, `team_id`),
    KEY `idx_competition_rank` (`competition_id`, `rank_position`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排名表';

CREATE TABLE IF NOT EXISTS `sms_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `code` VARCHAR(10) NOT NULL COMMENT '验证码',
    `type` VARCHAR(20) NOT NULL DEFAULT 'LOGIN' COMMENT '类型',
    `ip` VARCHAR(45) DEFAULT NULL COMMENT '请求IP',
    `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `used` TINYINT NOT NULL DEFAULT 0 COMMENT '是否已使用',
    PRIMARY KEY (`id`),
    KEY `idx_phone_sent` (`phone`, `sent_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信记录表';

CREATE TABLE IF NOT EXISTS `champion_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `competition_id` BIGINT NOT NULL COMMENT '赛事ID',
    `season_name` VARCHAR(50) NOT NULL COMMENT '赛季名称',
    `team_name` VARCHAR(50) NOT NULL COMMENT '冠军队伍名称',
    `captain_name` VARCHAR(50) DEFAULT NULL COMMENT '队长昵称',
    `members` TEXT COMMENT '队员名单(逗号分隔)',
    `crowned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '夺冠时间',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_competition` (`competition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='冠军历史表';

-- 测试环境管理员
INSERT INTO `user` (`phone`, `nickname`, `role`) VALUES ('13800000000', UNHEX('E7AEA1E79086E59198'), 'ADMIN');
