-- 基准战力表数据导入
-- 执行: docker exec -i malahot-mysql mysql -u root -p'Malahot2025!' --default-character-set=utf8mb4 malahot_test < /opt/malahot/sql/import-chikeai-data.sql

SET NAMES utf8mb4;
USE malahot_test;

-- 清空已有选手和冠军数据（保留管理员 id=1）
DELETE FROM `user` WHERE id > 1;
DELETE FROM `champion_history`;

-- SS级
INSERT INTO `user` (`phone`, `nickname`, `role`, `status`, `score`, `matches_played`, `wins`, `rating`, `champion_count`) VALUES
('13900000001', '练习', 'PLAYER', 1, 0, 0, 0, 'SS', 0),
('13900000002', '胖胖', 'PLAYER', 1, 0, 0, 0, 'SS', 0),
('13900000003', '大白熊', 'PLAYER', 1, 0, 0, 0, 'SS', 0),
('13900000004', '1d3e', 'PLAYER', 1, 0, 0, 0, 'SS', 0),
('13900000005', '廖律', 'PLAYER', 1, 0, 0, 0, 'SS', 0),
('13900000006', '倒钩狼', 'PLAYER', 1, 0, 0, 0, 'SS', 0);

-- S级
INSERT INTO `user` (`phone`, `nickname`, `role`, `status`, `score`, `matches_played`, `wins`, `rating`, `champion_count`) VALUES
('13900000007', 'tygg', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000008', '李香兰', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000009', '发哥', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000010', '阿中兜兜', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000011', 'lulu', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000012', '冯d', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000013', '稻草人', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000014', '文豪', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000015', '壮哥', 'PLAYER', 1, 0, 0, 0, 'S', 0),
('13900000016', '晨晨', 'PLAYER', 1, 0, 0, 0, 'S', 0);

-- A级
INSERT INTO `user` (`phone`, `nickname`, `role`, `status`, `score`, `matches_played`, `wins`, `rating`, `champion_count`) VALUES
('13900000017', '瓜神', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000018', '顾我', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000019', '93', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000020', '大明星', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000021', '大擦炮', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000022', 'CMM', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000023', 'dede', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000024', '小助手', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000025', '菜哥', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000026', '章鱼', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000027', '挠头', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000028', '兆焱', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000029', '贝菜', 'PLAYER', 1, 0, 0, 0, 'A', 0),
('13900000030', '阿细', 'PLAYER', 1, 0, 0, 0, 'A', 0);

-- B级
INSERT INTO `user` (`phone`, `nickname`, `role`, `status`, `score`, `matches_played`, `wins`, `rating`, `champion_count`) VALUES
('13900000031', 'BBC', 'PLAYER', 1, 0, 0, 0, 'B', 0),
('13900000032', '刀神', 'PLAYER', 1, 0, 0, 0, 'B', 0),
('13900000033', 'xxy', 'PLAYER', 1, 0, 0, 0, 'B', 0),
('13900000034', '断手', 'PLAYER', 1, 0, 0, 0, 'B', 0),
('13900000035', '拿皇', 'PLAYER', 1, 0, 0, 0, 'B', 0),
('13900000036', '明白人', 'PLAYER', 1, 0, 0, 0, 'B', 0),
('13900000037', '罗本', 'PLAYER', 1, 0, 0, 0, 'B', 0),
('13900000038', '婉神', 'PLAYER', 1, 0, 0, 0, 'B', 0),
('13900000039', '0932', 'PLAYER', 1, 0, 0, 0, 'B', 0);

-- C级
INSERT INTO `user` (`phone`, `nickname`, `role`, `status`, `score`, `matches_played`, `wins`, `rating`, `champion_count`) VALUES
('13900000040', 'ldj', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000041', 'sgk', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000042', '鱼神', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000043', '全员内鬼', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000044', '350', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000045', 'htc', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000046', '噗米', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000047', '小冰', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000048', '刀剑', 'PLAYER', 1, 0, 0, 0, 'C', 0),
('13900000049', '可可', 'PLAYER', 1, 0, 0, 0, 'C', 0);

-- D级
INSERT INTO `user` (`phone`, `nickname`, `role`, `status`, `score`, `matches_played`, `wins`, `rating`, `champion_count`) VALUES
('13900000050', 'ccm', 'PLAYER', 1, 0, 0, 0, 'D', 0),
('13900000051', '七宝', 'PLAYER', 1, 0, 0, 0, 'D', 0),
('13900000052', 'wt', 'PLAYER', 1, 0, 0, 0, 'D', 0),
('13900000053', '学姐', 'PLAYER', 1, 0, 0, 0, 'D', 0),
('13900000054', 'mzd', 'PLAYER', 1, 0, 0, 0, 'D', 0),
('13900000055', 'Nasty', 'PLAYER', 1, 0, 0, 0, 'D', 0);

-- E级
INSERT INTO `user` (`phone`, `nickname`, `role`, `status`, `score`, `matches_played`, `wins`, `rating`, `champion_count`) VALUES
('13900000056', '娇娇', 'PLAYER', 1, 0, 0, 0, 'E', 0),
('13900000057', '小糖', 'PLAYER', 1, 0, 0, 0, 'E', 0),
('13900000058', '麻辣烫', 'PLAYER', 1, 0, 0, 0, 'E', 0),
('13900000059', '鲤鱼王', 'PLAYER', 1, 0, 0, 0, 'E', 0);

-- F级
INSERT INTO `user` (`phone`, `nickname`, `role`, `status`, `score`, `matches_played`, `wins`, `rating`, `champion_count`) VALUES
('13900000060', '萌萌', 'PLAYER', 1, 0, 0, 0, 'F', 0),
('13900000061', 'szx', 'PLAYER', 1, 0, 0, 0, 'F', 0),
('13900000062', 'zyy', 'PLAYER', 1, 0, 0, 0, 'F', 0);

SELECT CONCAT('导入完成: ', COUNT(*), ' 名选手') AS result FROM `user` WHERE role='PLAYER';
