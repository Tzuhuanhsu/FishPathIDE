
import configparser
import json
import math
import pandas


config_file = 'Config.ini'
config_tag = "Setting"
config_excel_tag = "ExcelPath"


class FishWaveCreator:
    # 設定檔
    Config = None
    MainScript = []
    SubScript = {}
    GroupData = {}

    def __init__(self, param) -> None:
        print("======魚場路線執行======")

    def run(self):
        # 讀取Excel檔案
        self.ReadConfig()
        self.ReadMainScript()
        self.ReadSubScript()
        self.ReadGroup()
        print("======魚場路線執行 Successful======")

    # 讀取Config設定
    def ReadConfig(self) -> None:
        print("======取得Config 設定======")
        # 這裡可以添加實際的配置讀取邏輯
        config = configparser.ConfigParser()
        config.read(config_file, encoding='utf-8')
        self.Config = config["Setting"]

    # 讀取Main Script
    def ReadMainScript(self) -> None:
        print("=====ReadMainScript======")
        self.MainScript = []
        Excel_Data = pandas.read_excel(
            self.Config.get(config_excel_tag), sheet_name="MainScript", engine='openpyxl', header=0, index_col=0)
        for main_id in Excel_Data.columns:
            sub_ids = []
            # 遍歷列（SubScriptID）
            for sub_id, value in Excel_Data[main_id].items():
                print(f"MainID:{main_id} SubID:{sub_id} Value:{value}")
                if pandas.notna(value):  # 如果這格有值，代表有關聯
                    sub_ids.append(value)

            if sub_ids:
                self.MainScript.append({
                    "MainScriptID": int(main_id),
                    "Subscript": [int(x) for x in sub_ids]
                })
        # print(json.dumps(self.MainScript, indent=2))
        self.exportJson(self.MainScript, "MainScript.json")

    def ReadSubScript(self) -> None:
        print("=====ReadSubScript======")
        self.SubScript = {}
        Excel_Data = pandas.read_excel(
            self.Config.get(config_excel_tag), sheet_name="SubScript", engine='openpyxl', header=None)
        for i in range(1, len(Excel_Data)):
            row = Excel_Data.iloc[i]
            self.SubScript[row[0]] = {
                "Script": row[1],
                "Time": row[2],
            }

        # print(json.dumps(self.SubScript, indent=2))
        self.exportJson(self.SubScript, "SubScript.json")

    # 讀取Group

    def ReadGroup(self) -> None:
        print("=====ReadGroup======")
        groups = set()
        self.GroupData = {}
        for item in self.SubScript.values():
            groups.add(item["Script"])
        for group_name in groups:
            print(f"====Parser Group Name:{group_name}=====")
            Excel_Data = pandas.read_excel(
                self.Config.get(config_excel_tag), sheet_name=group_name, engine='openpyxl')

            # 檢查是否有 Unnamed 列
            unnamed_cols = [
                col for col in Excel_Data.columns if 'Unnamed' in str(col)]
            if unnamed_cols:
                print(f"警告：發現 Unnamed 列: {unnamed_cols}")
                # 選擇處理方式：刪除 Unnamed 列
                Excel_Data = Excel_Data.loc[:, ~Excel_Data.columns.str.contains(
                    'Unnamed', na=False)]
                print(f"已移除 Unnamed 列，剩餘列: {list(Excel_Data.columns)}")

            result = Excel_Data.to_dict(orient="records")
            for item in result:
                print("item:", item)
                if 'extra' in item and (item['extra'] is None or (isinstance(item['extra'], float) and math.isnan(item['extra']))):
                    item['extra'] = ""
            self.GroupData[group_name] = result

            # 輸出為 JSON 字串
        # print(json.dumps(self.GroupData, indent=2, ensure_ascii=False))
        self.exportJson(self.GroupData, "GroupData.json")

    def exportJson(self, data, exportName) -> None:

        import json
        with open(exportName, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)


if __name__ == "__main__":
    fish_wave_creator = FishWaveCreator("FishWaveCreator")
    fish_wave_creator.run()
