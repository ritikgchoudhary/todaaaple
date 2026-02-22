-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 19, 2026 at 09:15 PM
-- Server version: 8.0.36
-- PHP Version: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `softapi`
--

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `brand_id` int NOT NULL,
  `brand_title` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `brand_img` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `brand_cat` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `price` int NOT NULL,
  `brand_img_cdn` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`brand_id`, `brand_title`, `brand_img`, `brand_cat`, `created_at`, `price`, `brand_img_cdn`) VALUES
(45, 'PGSoft', 'uploads/brands/pgsoft.png', '13', '2025-09-28 11:19:54', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/pgsoft__eSCGuSud.png'),
(46, 'SABASports(IBC)', 'uploads/brands/sabasports-ibc.jpg', '15', '2025-09-28 11:19:54', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/sabasports-ibc_jLnyoDVBx.jpg'),
(48, 'UnitedGaming', 'uploads/brands/unitedgaming.png', '15', '2025-09-28 11:19:55', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/unitedgaming_mNkr4Q5Lu.png'),
(49, 'JILI', 'uploads/brands/jili.png', '13', '2025-09-28 11:19:55', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/jili_zCoKdKI0w.png'),
(50, 'JDB', 'uploads/brands/jdb.svg', '13', '2025-09-28 11:19:56', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/jdb_bfN7Li8aT.svg'),
(51, 'TADAGaming', 'uploads/brands/tadagaming.png', '13', '2025-09-28 11:19:56', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/tadagaming_VODQcWMhZ.png'),
(52, 'CQ9', 'uploads/brands/cq9.png', '13', '2025-09-28 11:19:56', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/cq9_GMWnfJS6j.png'),
(53, 'PragmaticPlay-EU', '../uploads/brands/brand_53_1759738767.png', '13', '2025-09-28 11:19:57', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_53_1759738767_0RTFI0ruM.png'),
(54, 'PragmaticPlay-Asia', '../uploads/brands/brand_54_1759738767.png', '13', '2025-09-28 11:19:57', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_54_1759738767_XUvlduUi2.png'),
(55, 'PragmaticPlayLive-EU', '../uploads/brands/brand_55_1759738768.png', '14', '2025-09-28 11:19:57', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_55_1759738768_pO-J--EsT.png'),
(56, 'PragmaticPlayLive-Asia', '../uploads/brands/brand_56_1759738767.png', '14', '2025-09-28 11:19:57', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_56_1759738767_X-OOEWVG3.png'),
(57, 'Spribe', 'uploads/brands/spribe.png', '13', '2025-09-28 11:19:57', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/spribe_PT57NjKD1.png'),
(58, 'Evolution Live', '../uploads/brands/brand_58_1759739497.png', '14', '2025-09-28 11:19:57', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_58_1759739497_u136bxtGP.png'),
(59, 'Evolution Live (Asia)', '../uploads/brands/brand_59_1759739498.png', '14', '2025-09-28 11:19:57', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_59_1759739498_kDA8fpQtV.png'),
(60, 'YeeBet', 'uploads/brands/yeebet.png', '14', '2025-09-28 11:19:58', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/yeebet_Qkd_HP7B1.png'),
(61, 'FaChaiGaming', 'uploads/brands/fachaigaming.png', '13', '2025-09-28 11:19:58', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/fachaigaming_XDlsvQLjm.png'),
(62, 'BigTimeGaming', 'uploads/brands/bigtimegaming.jpg', '13', '2025-09-28 11:19:59', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/bigtimegaming_R1n1_ixJN.jpg'),
(63, 'BigTimeGaming(Asia)', 'uploads/brands/bigtimegaming-asia.jpg', '13', '2025-09-28 11:19:59', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/bigtimegaming-asia_iJ_C78lGQ.jpg'),
(64, 'GameArt', 'uploads/brands/gameart.png', '13', '2025-09-28 11:19:59', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/gameart_NBb8dzy_S.png'),
(65, 'Bgaming', 'uploads/brands/bgaming.png', '13', '2025-09-28 11:20:00', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/bgaming_pdaAU3WLj.png'),
(66, 'NoLimit City（Asia）', 'uploads/brands/nolimit-city-asia.png', '13', '2025-09-28 11:20:00', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/nolimit-city-asia_Bw3lMxQ63.png'),
(67, 'NoLimit City', 'uploads/brands/nolimit-city.png', '13', '2025-09-28 11:20:00', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/nolimit-city_dGZqMlHEI.png'),
(68, 'Netent', 'uploads/brands/netent.png', '13', '2025-09-28 11:20:00', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/netent_PcottkcL9.png'),
(69, 'Netent（Asia）', '../uploads/brands/brand_69_1759742598.png', '13', '2025-09-28 11:20:00', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_69_1759742598_NnaIvF82-.png'),
(70, 'RelaxGaming', 'uploads/brands/relaxgaming.png', '13', '2025-09-28 11:20:00', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/relaxgaming_-Yg8pOo7k.png'),
(71, 'Skywind', '../uploads/brands/brand_71_1759745923.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_71_1759745923_jGiWGxkyY.png'),
(72, 'Playtech', 'uploads/brands/playtech.svg', '14', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/playtech_kh3OoJoCZ.svg'),
(73, 'PlaynGo', 'uploads/brands/playngo.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/playngo_M64H004gH.png'),
(74, 'RedTiger', 'uploads/brands/redtiger.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/redtiger_GckNg_i4e.png'),
(75, 'RedTiger（Asia）', '../uploads/brands/brand_75_1759742711.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_75_1759742711_p_BDBA0F5.png'),
(76, 'Playson', 'uploads/brands/playson.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/playson_TVurEdDE9.png'),
(77, 'Evoplay', 'uploads/brands/evoplay.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/evoplay_1A4Zz15L6.png'),
(78, 'Ezugi', 'uploads/brands/ezugi.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/ezugi_YOoNA87AJ.png'),
(79, 'iDeal', 'uploads/brands/ideal.png', '14', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/ideal_JfiVSmlvK.png'),
(80, 'T1', 'uploads/brands/t1.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/t1_SVPjMoD7a.png'),
(81, 'PlayAce(AgGaming)', 'uploads/brands/playace-aggaming.png', '13', '2025-09-28 11:20:01', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/playace-aggaming_IVBgkzHHl.png'),
(82, 'Astar', 'uploads/brands/astar.png', '14', '2025-09-28 11:20:02', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/astar_qR5tTKi4v.png'),
(83, 'LuckySport', '../uploads/brands/brand_83_1759747195.png', '15', '2025-09-28 11:20:03', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_83_1759747195_Atqb52OM-.png'),
(84, 'Rich88', 'uploads/brands/rich88.png', '13', '2025-09-28 11:20:04', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/rich88_UywTBtIVM.png'),
(85, 'TF', 'uploads/brands/tf.png', '15', '2025-09-28 11:20:05', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/tf_Hfhq23ykw.png'),
(86, 'NextSpin', '../uploads/brands/brand_86_1759753285.webp', '13', '2025-09-28 11:20:05', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_86_1759753285_gXkNIjtpb.webp'),
(87, 'DreamGaming', 'uploads/brands/dreamgaming.jpg', '14', '2025-09-28 11:20:05', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/dreamgaming_orGaXRnvq.jpg'),
(88, 'Sexy', 'uploads/brands/sexy.png', '14', '2025-09-28 11:20:05', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/sexy_6tieOBYXp.png'),
(89, 'Sagaming', 'uploads/brands/sagaming.png', '14', '2025-09-28 11:20:06', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/sagaming_3lTI1C8VE.png'),
(90, 'Microgaming', 'uploads/brands/microgaming.png', '14', '2025-09-28 11:20:06', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/microgaming_mm5ILoG4V.png'),
(91, 'Habanero', 'uploads/brands/habanero.svg', '13', '2025-09-28 11:20:06', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/habanero_TzgioUNJE.svg'),
(92, 'YGRGaming', 'uploads/brands/ygrgaming.jpg', '13', '2025-09-28 11:20:06', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/ygrgaming_TbLfUpZzc.jpg'),
(93, 'KoolBet', 'uploads/brands/koolbet.jpg', '16', '2025-09-28 11:20:06', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/koolbet_GfoRDo30w.jpg'),
(94, 'DpEsports', 'uploads/brands/dpesports.png', '15', '2025-09-28 11:20:07', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/dpesports_oL4ejT2g1.png'),
(95, 'DpSports', 'uploads/brands/dpsports.png', '15', '2025-09-28 11:20:08', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/dpsports_6EVgDlxnv.png'),
(96, '3Oaks (BNG)', '../uploads/brands/brand_96_1759754794.PNG', '13', '2025-09-28 11:20:09', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_96_1759754794_tsdHQmqWO.PNG'),
(97, 'Hacksaw Asia', 'uploads/brands/hacksaw-asia.png', '13', '2025-09-28 11:20:09', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/hacksaw-asia_oCM4030vb.png'),
(98, 'Hacksaw Latam', 'uploads/brands/hacksaw-latam.png', '13', '2025-09-28 11:20:09', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/hacksaw-latam_vKVa1IAKd.png'),
(99, 'Hacksaw World', 'uploads/brands/hacksaw-world.png', '13', '2025-09-28 11:20:09', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/hacksaw-world_DzjKeVGna.png'),
(100, 'Turbogames Asia', 'uploads/brands/turbogames-asia.png', '13', '2025-09-28 11:20:09', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/turbogames-asia_x-LY05KTt.png'),
(101, 'Turbogames World', 'uploads/brands/turbogames-world.png', '13', '2025-09-28 11:20:09', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/turbogames-world_hhq2EG8ZD.png'),
(102, 'OneGaming', 'uploads/brands/onegaming.png', '13', '2025-09-28 11:20:09', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/onegaming_US8ajzcPi.png'),
(103, '5gGaming', 'uploads/brands/5ggaming.png', '13', '2025-09-28 11:20:11', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/5ggaming_tTaDa1S0F.png'),
(104, 'Mini', 'uploads/brands/mini.png', '13', '2025-09-28 11:20:11', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/mini_pVhCJw440.png'),
(105, '2J', '../uploads/brands/brand_105_1759755216.png', '13', '2025-09-28 11:20:12', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_105_1759755216_d8ysyB9Bd.png'),
(106, 'EpicWin', 'uploads/brands/epicwin.png', '13', '2025-09-28 11:20:13', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/epicwin_cHPP34SvY.png'),
(107, 'Smartsoft', 'uploads/brands/smartsoft.png', '13', '2025-09-28 11:20:13', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/smartsoft_pqTVVLSgg.png'),
(108, 'Wonwon', '../uploads/brands/brand_108_1759755400.PNG', '13', '2025-09-28 11:20:14', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_108_1759755400_NoNC975dE.PNG'),
(109, 'BtGaming', 'uploads/brands/btgaming.png', '13', '2025-09-28 11:20:15', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/btgaming_4Sg3NMWJ-.png'),
(110, 'Pix', 'uploads/brands/pix.png', '13', '2025-09-28 11:20:15', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/pix_Sk-nLiaKt.png'),
(111, 'Galaxsys', '../uploads/brands/brand_111_1759755586.png', '13', '2025-09-28 11:20:16', 50, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_111_1759755586_QYQ6oiwvw.png'),
(112, 'InOut', 'uploads/brands/inout.svg', '13', '2025-09-28 11:20:16', 12, 'https://ik.imagekit.io/f4rqxekfu/brands/inout_L95ybT6Vl.svg'),
(113, 'V8 CARD', '../uploads/brands/brand_113_1759757270.webp', '16', '2025-10-04 11:15:19', 20, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_113_1759757270_KyAOcxq5j.webp'),
(114, 'WM CASINO', 'uploads/brands/1759580526-wm-casino.png', '14', '2025-10-04 12:22:06', 20, 'https://ik.imagekit.io/f4rqxekfu/brands/1759580526-wm-casino_gfuzIsjHR.png'),
(117, 'EazyGaming', 'uploads/brands/1759584633-headerLogo.png', '13', '2025-10-04 13:30:33', 20, 'https://ik.imagekit.io/f4rqxekfu/brands/1759584633-headerLogo_ovoTgi_ge.png'),
(118, 'BtiGaming', 'uploads/brands/1759690799-images.png', '15', '2025-10-05 18:59:59', 20, 'https://ik.imagekit.io/f4rqxekfu/brands/1759690799-images_A5pMrF4oS.png'),
(119, 'King Midas', 'uploads/brands/1759745485-kingmidas.png', '13', '2025-10-06 10:11:25', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1759745485-kingmidas_hnP8rc8ZJ.png'),
(120, 'King Midas - One Gaming', 'uploads/brands/1759746283-kingmidas.png', '13', '2025-10-06 10:24:43', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1759746283-kingmidas_Oqu0zjno0.png'),
(121, 'OnGaming', '../uploads/brands/brand_121_1759746876.png', '14', '2025-10-06 10:33:48', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_121_1759746876_jnFiPaUL5b.png'),
(122, 'AOG', '../uploads/brands/brand_122_1759749392.png', '14', '2025-10-06 10:43:47', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/brand_122_1759749392_NEAf74Igf.png'),
(123, 'PgsGaming', 'uploads/brands/1759749692-bc55-game-brand-logo-pegasus.png', '13', '2025-10-06 11:21:32', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1759749692-bc55-game-brand-logo-pegasus_8ltp7Dy3l.png'),
(124, 'Expanse', 'uploads/brands/1759755996-vvcvcv.PNG', '13', '2025-10-06 13:06:36', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1759755996-vvcvcv_ffim_MyzU.PNG'),
(125, 'FAST SPIN', 'uploads/brands/1759756425-sdsdds.PNG', '13', '2025-10-06 13:13:45', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1759756425-sdsdds__z5wLkmya.PNG'),
(126, 'SBO', 'uploads/brands/1759756460-scxxc.PNG', '15', '2025-10-06 13:14:20', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1759756460-scxxc_oxD99dBJS6.PNG'),
(128, 'Askmeslot', '', '17', '2026-02-10 03:29:42', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770665380-askmeslot_logo_-OY4t2_NYB.webp'),
(129, 'Vplus', '', '17', '2026-02-10 03:40:53', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770666052-vpus__nilYIAg6B.png'),
(130, 'Casini', '', '17', '2026-02-10 03:47:38', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770666456-casini-black-text-logo.cde821af64f85d0da29386a6985e2a8f_-mnrWVgfL.svg'),
(131, '100HP', '', '17', '2026-02-10 03:49:45', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770666578-100HPWHITE-removebg-preview_hJt231z9y.webp'),
(132, 'MT GAMING', '', '19', '2026-02-10 03:55:31', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770666928-t_zsSn-g7oM.png'),
(133, 'KA', '', '17', '2026-02-10 03:57:11', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770667025-Screenshot_2026-02-10_012653_MHJo17sYY.png'),
(134, 'Casino Game (CG)', '', '14', '2026-02-10 03:59:39', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770667178-logo-cg-game_tLSGmLofX.png'),
(135, 'Crowdplay', '', '17', '2026-02-10 04:04:08', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770667442-clow_pau_wHSEuDeuk.png'),
(136, 'RubyPlay', '', '17', '2026-02-10 04:09:48', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770667786-rubyplay_logo_01_colour_alt_YQ9e9e-zP.webp'),
(137, 'Amigo', '', '17', '2026-02-10 04:12:16', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770667934-logo_i_pIoQF60.svg'),
(138, 'ATM', '', '22', '2026-02-10 04:14:10', 18, 'https://ik.imagekit.io/f4rqxekfu/brands/1770668042-logo__11__hGN9bryFr.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`brand_id`),
  ADD KEY `idx_brand_id` (`brand_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `brand_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
