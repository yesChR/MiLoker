import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  confirmColor = "danger",
  onConfirm,
  icon = null,
  size = "md", // Nuevo prop para tamaño
  showIcon = true, // Nuevo prop para mostrar/ocultar ícono
  centered = true, // Nuevo prop para centrar contenido
  customContent = null // Nuevo prop para contenido personalizado
}) => {
  
  // Configuración de temas y estilos
  const themeConfig = {
    danger: {
      icon: <FiAlertTriangle className="w-8 h-8" />,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      titleColor: "text-red-900",
      gradient: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
    },
    success: {
      icon: <FiCheckCircle className="w-8 h-8" />,
      iconBg: "bg-green-100", 
      iconColor: "text-green-600",
      titleColor: "text-green-900",
      gradient: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
    },
    primary: {
      icon: <FiInfo className="w-8 h-8" />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600", 
      titleColor: "text-blue-900",
      gradient: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
    },
    warning: {
      icon: <FiAlertTriangle className="w-8 h-8" />,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      titleColor: "text-yellow-900", 
      gradient: "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
    },
    default: {
      icon: <FiInfo className="w-8 h-8" />,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      titleColor: "text-gray-900",
      gradient: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
    }
  };

  // Configuración de tamaños
  const sizeConfig = {
    sm: "max-w-sm",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  const currentTheme = themeConfig[confirmColor] || themeConfig.default;
  const modalIcon = icon || currentTheme.icon;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Componente para el ícono
  const IconSection = () => (
    showIcon && (
      <div className="flex justify-center mb-6">
        <div className={`${currentTheme.iconBg} ${currentTheme.iconColor} p-4 rounded-full shadow-lg ring-4 ring-white/50 animate-pulse-slow`}>
          {modalIcon}
        </div>
      </div>
    )
  );

  // Componente para el título
  const TitleSection = () => (
    <h3 className={`text-xl font-bold ${centered ? 'text-center' : 'text-left'} ${currentTheme.titleColor} leading-tight mb-2`}>
      {title}
    </h3>
  );

  // Componente para el contenido
  const ContentSection = () => (
    <div className={centered ? 'text-center' : 'text-left'}>
      {customContent ? (
        customContent
      ) : (
        <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">
          {description}
        </p>
      )}
    </div>
  );

  // Componente para los botones
  const ButtonSection = () => (
    <div className={`flex gap-3 ${centered ? 'justify-center' : 'justify-end'}`}>
      {cancelText && (
        <Button 
          color="default" 
          variant="bordered"
          onPress={onClose}
          className="px-6 py-2 font-medium hover:bg-gray-50 border-2 transition-all duration-200 hover:scale-105 active:scale-95"
          size="lg"
        >
          {cancelText}
        </Button>
      )}
      <Button 
        color={confirmColor} 
        onPress={handleConfirm}
        className={`px-6 py-2 font-medium shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${currentTheme.gradient}`}
        size="lg"
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      placement="center"
      backdrop="blur"
      size={size}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        }
      }}
      classNames={{
        base: `${sizeConfig[size]} mx-4`,
        backdrop: "bg-gradient-to-t from-zinc-900/50 to-zinc-900/50",
        body: "py-8 px-6",
        footer: "px-6 py-4",
        closeButton: "hover:bg-white/5 active:bg-white/10 transition-colors",
      }}
    >
      <ModalContent className="bg-white/95 backdrop-blur-md shadow-2xl border border-white/20">
        <ModalHeader className="flex flex-col gap-1 px-6 pt-6 pb-2 border-b-0">
          <IconSection />
          <TitleSection />
        </ModalHeader>
        
        <ModalBody className={centered ? 'text-center' : ''}>
          <ContentSection />
        </ModalBody>
        
        <ModalFooter className="border-t border-divider/30">
          <ButtonSection />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmModal;