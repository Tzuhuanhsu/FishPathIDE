# 路徑編輯器 & 測試

## FishPathEditor.scene 路徑編輯場景
- ### 配合 FishPathEditor.Prefab使用
- ### FishPathEditor 會有FishPathCreator Component
- #### Path Data:要放輸出的JSON路徑腳本(記得要換)
- #### 在場景上編排PathPoint的Child節點產生出自己的需求路徑
- #### 在按輸出就可以完成路徑編排了

## FishPathRunning.scene 路徑測試場景
- ### 節點GameManager 當中的 Component 有以下Components
    - FactoryManager:要掛對應的Fish Prefab、ID、產出節點
    - FishPathIDSetting 要掛上對應的路徑 ID 與 JSON
    - FishMgr 目前用來管理場景上的魚
    - FishPathMgr
        MainScript:魚群主要腳本
        SubScript:魚群子腳本
        GroupScript:魚群路徑腳本
- ### 沒有特殊需求直接更新 Datas 當中的GroupData.json、MainScript.json、SunScript.json就可以了
- ### 產出方式參考 Tool/魚場產生器
