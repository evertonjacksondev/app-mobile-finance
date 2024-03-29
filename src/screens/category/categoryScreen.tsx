import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, KeyboardAvoidingView } from 'react-native';
import CategoryItem from '../../components/category/category-item';
import CustomInput from '../../components/global/custom-input';
import HeaderStack from '../../components/global/header-stack';
import { ThemeContext } from '../../contexts/themeContext';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { styles } from './styles';
import CustomButtonAnimated from '../../components/global/custom-button-animated';
import SelectColor from '../../components/global/color';
import SelectIcon from '../../components/global/icon';
import { AppCategoryService } from '../../services/category';
import AlertError from '../../components/global/alert-error';
import { CategoryEntity } from '../../interfaces/services/category.interface';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

const CategoryScreen: React.FC<{ selectCategory?: (category: CategoryEntity) => void, close?: () => void }> = (props) => {
    const { theme } = React.useContext(ThemeContext);
    const style = styles(theme);

    const navigation = useNavigation<StackNavigationProp<any>>();

    const [categories, setCategories] = React.useState<CategoryEntity[]>([]);
    const [openCreateCategory, setOpenCreateCategory] = React.useState<boolean>(false);
    const [openColorSelect, setOpenColorSelect] = React.useState<boolean>(false);
    const [openIconSelect, setOpenIconSelect] = React.useState<boolean>(false);
    const [loadingEnd, setLoadingEnd] = React.useState<boolean>(false);

    const [title, setTitle] = React.useState<string>();
    const [color, setColor] = React.useState<string>();
    const [icon, setIcon] = React.useState<string>();

    const [validation, setValidation] = React.useState<string[]>([]);

    React.useEffect(() => {
        getCategories()
    }, [openCreateCategory])

    const getCategories = async () => {
        const categories = await AppCategoryService.find();
        setCategories(categories)
    }

    const createCategory = async () => {
        try {
            const erros = [];
            if (!title || !title?.trim()?.length) erros.push("Título é obrigatório")
            if (!color || !color?.trim()?.length) erros.push("Cor é obrigatória")
            if (!icon || !icon?.trim()?.length) erros.push("Icone é obrigatório")

            setValidation(erros)

            if (erros.length) {
                setLoadingEnd(!loadingEnd)
                return
            }

            if (!title || !color || !icon) return;

            await AppCategoryService.create({ name: title, color, icon });
            setLoadingEnd(!loadingEnd)
            setOpenCreateCategory(false)
        } catch (error: any) {
            if (error?.message) setValidation([error.message])
        } finally { setLoadingEnd(!loadingEnd) }
    }

    const selectItem = (category: CategoryEntity) => {
        if (props?.selectCategory) {
            props.selectCategory(category)
        }
    }

    const navigate = () => {
        if (!props?.close) {
            navigation.goBack()
        } else {
            props.close()
        }
    }

    return (
        <View style={style.container}>
            <HeaderStack title='Categorias' onRequestClose={navigate} />

            <TouchableOpacity style={style.button} onPress={() => { setOpenCreateCategory(true) }}>
                <Text style={style.buttonText}>+ Nova categoria</Text>
            </TouchableOpacity>

            <FlatList
                data={categories}
                renderItem={({ item }) => <CategoryItem item={item} selectItem={selectItem} />}
                keyExtractor={(item, index) => index.toString()}
            />

            <Modal transparent={true} visible={openCreateCategory}>
                <View style={style.backdrop} />
                <KeyboardAvoidingView behavior="height">
                    <View style={style.modal}>
                        <HeaderStack title='Nova categoria' onRequestClose={() => { setOpenCreateCategory(false) }} />

                        <AlertError errors={validation} />

                        <CustomInput
                            icon={<MaterialIcons name="title" size={20} color={theme.button.primary} />}
                            onChangeText={setTitle}
                            style={style.input}
                            styleInput={style.inputText}
                            placeholder="Titulo"
                            placeholderTextColor="#b3b3b3"
                        />

                        <TouchableOpacity style={style.containerSelect} activeOpacity={.5} onPress={() => { setOpenIconSelect(true) }}>
                            <View style={style.containerSelectIcon}>
                                <View style={style.selectIcon}>
                                    <MaterialIcons name="category" size={19} color={theme.button.primary} />
                                </View>
                                {icon && <FontAwesome5 name={icon} size={16} color={theme.text.primary} />}
                                <Text style={style.selectText}>Icone</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={19} color={theme.text.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={style.containerSelect} activeOpacity={.5} onPress={() => { setOpenColorSelect(true) }}>
                            <View style={style.containerSelectIcon}>
                                <View style={style.selectIcon}>
                                    <Ionicons name="color-fill-outline" size={19} color={theme.button.primary} />
                                </View>
                                {color && <View style={[style.colorSelected, { backgroundColor: color }]} />}
                                <Text style={style.selectText}>Cor</Text>
                            </View>
                            <MaterialIcons name="keyboard-arrow-right" size={19} color={theme.text.primary} />
                        </TouchableOpacity>

                        <View style={style.containerButton}>
                            <CustomButtonAnimated
                                buttonText='Salvar'
                                background={theme.button.primary}
                                onPress={createCategory}
                                isLoadingButton={true}
                                loadingEnd={loadingEnd}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal transparent={true} visible={openColorSelect} onRequestClose={() => { setOpenColorSelect(false) }}>
                <View style={style.backdrop} />
                <View style={[style.modal, { height: "60%", }]}>
                    <SelectColor selectedColor={color} setColor={(color) => {
                        setColor(color)
                        setOpenColorSelect(false)
                    }} />
                </View>

            </Modal>
            <Modal transparent={true} visible={openIconSelect} onRequestClose={() => { setOpenIconSelect(false) }}>
                <View style={style.backdrop} />
                <View style={[style.modal, { height: "60%", }]}>
                    <SelectIcon selectedIcon={icon} setIcon={(icon) => {
                        setIcon(icon)
                        setOpenIconSelect(false)
                    }} />
                </View>
            </Modal>
        </View>
    );
}

export default CategoryScreen;