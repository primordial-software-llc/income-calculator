import CashViewModel from "../views/balance-sheet/cash-view-model";
import BondViewModel from "../views/balance-sheet/bond-view-model";
import InventoryViewModel from "../views/balance-sheet/inventory-view-model";
import EquityViewModel from "../views/balance-sheet/equity-view-model";
import PropertyPlantAndEquipmentViewModel from "../views/balance-sheet/property-plant-and-equipment-view-model";

export default class AssetViewModels {

    static getAssetViewModels() {
        return [
            new CashViewModel(),
            new BondViewModel(),
            new InventoryViewModel(),
            new EquityViewModel(),
            new PropertyPlantAndEquipmentViewModel('Land', 'land'),
            new PropertyPlantAndEquipmentViewModel('Stocks & Bonds', 'non-liquid-stocks-and-bonds'),
            new PropertyPlantAndEquipmentViewModel('Collectibles', 'collectibles'),
            new PropertyPlantAndEquipmentViewModel('Depreciating Assets', 'property-plant-and-equipment')
        ];
    }


}