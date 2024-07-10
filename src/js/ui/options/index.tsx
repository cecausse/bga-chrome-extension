import React from "preact";
import { useEffect, useState, useMemo } from "preact/hooks";

import Configuration, { Game } from "../../config/configuration";
import Switch from "../base/Switch";
import { updateBadgeAndIcon } from "../../utils/updateBadgeAndIcon";

import "../../../css/options.css";
import "../../../css/switch.css";

const Options = (props: { config: Configuration }) => {
	const { config } = props;
	const [list, setList] = useState(config.getGamesList());
	const [selected, setSelected] = useState(list[0]);
	const [changed, setChanged] = useState(false);
	const [text, setText] = useState("");
	const [css, setCss] = useState(config.getCustomCss());
	const [tabSelected, setTabSelected] = useState("misc");
	const [hiddenGames, setHiddenGames] = useState(config.getHiddenGames());
	const [tracking, setTracking] = useState(config.isTrackingEnable());
	const [motionSensitivity, setMotionSensitivity] = useState(config.isMotionSensitivityEnable());
	const smallInterface = useMemo(() => document.body.clientWidth < 400, []);

	const serialize = (game: Game) => {
		return JSON.stringify(
			game,
			[
				"name",
				"position",
				"top",
				"bottom",
				"left",
				"boardPanel",
				"boardPanelOffset",
				"boardPanelText",
				"myPanel",
				"playerPanel",
				"playerPanelOffset",
				"bottomPanel",
				"bottomPanelOffset",
				"iconBackground",
				"iconBackgroundDark",
				"iconBorder",
				"iconColor",
				"iconShadow",
				"customZoomContainer",
				"css",
			],
			2,
		);
	};

	useEffect(() => setText(serialize(selected)), [selected]);
	useEffect(() => {
		setChanged(serialize(selected) !== text);
	}, [selected, text]);
	useEffect(() => {
		const newSelected = list.find((g) => g.name === selected.name);
		if (newSelected) {
			setSelected({ ...newSelected });
		} else {
			setSelected(list[0]);
		}
	}, [list, selected.name]);

	const reset = () => {
		setList(config.resetGame(selected.name));
	};

	const save = () => {
		try {
			const game = JSON.parse(text);
			setList(config.saveGame(selected.name, game));
			setSelected(game);
		}
		catch (error) {
			window.location.reload();
		}
	};

	const duplicate = () => {
		const newGame = { ...selected, name: `${selected.name}_copy` };
		setList(config.saveGame(newGame.name, newGame));
		setSelected(newGame);
	};

	const isCustomized = config.isCustomized(selected.name);
	const isDefault = config.isDefault(selected.name);
	const couldReset = changed || (isCustomized && isDefault);
	const couldDelete = isCustomized && !isDefault;

	const updateTracking = (val: boolean) => {
		setTracking(val);
		config.setTrackingEnable(val);

		if (val) {
			updateBadgeAndIcon({ nbPendingInvites: 0, nbWaitingTables: 0, tracking: true });
		} else {
			updateBadgeAndIcon({ nbPendingInvites: 0, nbWaitingTables: 0, tracking: false });
		}
	};

	const updateFlashing = (val: boolean) => {
		setMotionSensitivity(!val);
		config.setMotionSensitivityEnable(!val);
	};

	const getMiscConfiguration = () => {
		return (
			<>
				<div className="bgext_options_title">
					{chrome.i18n.getMessage("optionMiscTitle")}
				</div>
				<div className="bgext_misc_container">
					<Switch
						checked={tracking}
						textOn={chrome.i18n.getMessage("optionsTrackingOn")}
						textOff={chrome.i18n.getMessage("optionsTrackingOff")}
						onChange={updateTracking}
					/>
					<Switch
						checked={!motionSensitivity}
						textOn={chrome.i18n.getMessage("optionsFlashingOn")}
						textOff={chrome.i18n.getMessage("optionsFlashingOff")}
						onChange={updateFlashing}
					/>
				</div>
			</>
		);
	};

	const getHiddenConfiguration = () => {
		return (
			<>
				<div className="bgext_options_title">
					{chrome.i18n.getMessage("optionHiddenTitle")}
				</div>
				<div className="bgext_hidden_games_container">
					{!hiddenGames.length && (
						<span>
							{chrome.i18n.getMessage("optionNoHiddenGames")}
						</span>
					)}
					{hiddenGames.length > 0 &&
						hiddenGames.map((game, index) => (
							<div
								className="bgext_hidden_game"
								key={`game_${index}`}
							>
								{game}
								<div
									className="bgext_hidden_game_close"
									onClick={() =>
										setHiddenGames(config.displayGame(game))
									}
								>
									🗙
								</div>
							</div>
						))}
				</div>
				<div className="bgext_options_warning">
					{chrome.i18n.getMessage("optionHiddenGamesWarning")}
				</div>
			</>
		);
	};

	const getNavigationConfiguration = () => {
		return (
			<>
				<div className="bgext_options_title">
					{chrome.i18n.getMessage("optionNavigationTitle")}
				</div>
				<div className="bgext_options_container">
					<div className="bgext_options_gamelist_container">
						<div className="bgext_options_gamelist">
							{list.map((g, i) => {
								const className =
									selected.name === g.name
										? "bgext_options_gameitem_selected"
										: "bgext_options_gameitem";
								return (
									<div
										className={className}
										key={`game_${i}`}
										onClick={() => setSelected(g)}
									>
										{g.name}
									</div>
								);
							})}
						</div>
					</div>
					<div className="bgext_options_col_container">
						<div className="bgext_options_gameconfig_container">
							<textarea
								id="game_config"
								className="bgext_options_input"
								value={text}
								onChange={(evt) => setText((evt.target as any).value)}
								onKeyUp={() => setText((document.getElementById("game_config") as any).value)}
							/>
						</div>
						<div className="bgext_options_row_container">
							<button
								style={{ width: "100px" }}
								onClick={duplicate}
							>
								{chrome.i18n.getMessage("optionDuplicate")}
							</button>
							<button
								disabled={!couldReset}
								style={{ width: "100px" }}
								onClick={reset}
							>
								{chrome.i18n.getMessage("optionReset")}
							</button>
							<button
								disabled={!couldDelete}
								style={{ width: "100px" }}
								onClick={reset}
							>
								{chrome.i18n.getMessage("optionDelete")}
							</button>
							<button
								disabled={!changed}
								style={{ width: "100px" }}
								onClick={save}
							>
								{chrome.i18n.getMessage("optionSave")}
							</button>
						</div>
					</div>
				</div>
				<div className="bgext_options_warning">
					{chrome.i18n.getMessage("optionNavigationWarning")}
				</div>
			</>
		);
	};

	const getCssConfiguration = () => {
		return (
			<>
				<div className="bgext_options_title">
					{chrome.i18n.getMessage("optionCssTitle")}
				</div>
				<div className={smallInterface ? "bgext_css_container_small" : "bgext_css_container"}>
					<textarea
						id="css_config"
						className="bgext_options_input"
						value={css}
						onChange={(evt) => setCss((evt.target as any).value)}
						onKeyUp={() => setCss((document.getElementById("css_config") as any).value)}
					/>
				</div>
				<div className="bgext_css_buttons">
					<button
						style={{ width: "100px" }}
						onClick={() => config.setCustomCss(css).catch(_ => window.location.reload())}
					>
						{chrome.i18n.getMessage("optionSave")}
					</button>
				</div>
			</>
		);
	};

	const getTab = (tabId: string, tabText: string) => {
		return (
			<div
				className={
					tabSelected === tabId
						? "bgext_link_selected"
						: "bgext_link"
				}
				href="#"
				selected={tabSelected === tabId}
				onClick={() => setTabSelected(tabId)}
			>
				{tabText}
			</div>
		);
	};

	try {
		return (
			<div className="bgext_options_main">
				<div className={smallInterface ? "bgext_options_config_area_small" : "bgext_options_config_area"}>
					<div className="bgext_links_area">
						{getTab("misc", chrome.i18n.getMessage("optionMisc"))}
						{!smallInterface && getTab("hidden", chrome.i18n.getMessage("optionHiddenTab"))}
						{!smallInterface && getTab("navigation", chrome.i18n.getMessage("optionNavigationTab"))}
						{getTab("css", chrome.i18n.getMessage("optionCssTab"))}
					</div>
					{tabSelected === "misc" && getMiscConfiguration()}
					{tabSelected === "hidden" && getHiddenConfiguration()}
					{tabSelected === "navigation" && getNavigationConfiguration()}
					{tabSelected === "css" && getCssConfiguration()}
				</div>
			</div>
		);
	}
	catch (error) {
		window.location.reload();
		return <></>;
	}
};

export default Options;
